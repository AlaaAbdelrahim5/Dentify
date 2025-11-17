const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// Get payment statistics for dentist
router.get('/stats', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;

    // Get all treatments for this dentist
    const treatments = await prisma.treatment.findMany({
      where: { dentistId },
      include: {
        payments: true
      }
    });

    const totalRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    const totalPending = treatments.reduce((sum, t) => sum + (t.totalAmount - t.paidAmount), 0);
    const totalPayments = await prisma.payment.count({
      where: {
        treatment: {
          dentistId
        }
      }
    });

    // Get today's payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = await prisma.payment.aggregate({
      where: {
        treatment: {
          dentistId
        },
        paymentDate: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        amount: true
      }
    });

    res.json({ 
      data: {
        totalRevenue,
        totalPending,
        totalPayments,
        todayRevenue: todayPayments._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// Get all payments for dentist
router.get('/dentist/my-payments', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { patientId, method, startDate, endDate } = req.query;

    const where = {
      treatment: {
        dentistId
      }
    };

    if (patientId && patientId !== 'all') {
      where.treatment.patientId = parseInt(patientId);
    }

    if (method && method !== 'all') {
      where.method = method.toUpperCase();
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        treatment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all payments for patient
router.get('/patient/my-payments', authenticate, authorize('Patient'), async (req, res) => {
  try {
    const patientId = req.user.id;
    const { method, startDate, endDate } = req.query;

    const where = {
      patientUserId: patientId
    };

    if (method && method !== 'all') {
      where.method = method.toUpperCase();
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        treatment: {
          include: {
            dentist: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payments for a specific treatment
router.get('/treatment/:treatmentId', authenticate, async (req, res) => {
  try {
    const { treatmentId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { treatmentId: parseInt(treatmentId) },
      include: {
        treatment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        treatment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Create new payment
router.post('/', authenticate, authorize('Dentist'), async (req, res) => {
  try {
    const dentistId = req.user.id;
    const { treatmentId, amount, discount = 0, method, notes } = req.body;

    // Validate required fields
    if (!treatmentId || !amount || !method) {
      return res.status(400).json({ error: 'Treatment ID, amount, and payment method are required' });
    }

    // Check if treatment exists and belongs to dentist
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(treatmentId) }
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    if (treatment.dentistId !== dentistId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate payment amount
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'Payment amount must be greater than zero' 
      });
    }

    // Calculate remaining balance after considering existing payments and discounts
    const remainingBalance = treatment.totalAmount - treatment.treatmentDiscount - treatment.paidAmount;
    
    // Check if payment doesn't exceed remaining balance
    if (parseFloat(amount) > remainingBalance) {
      return res.status(400).json({ 
        error: `Payment amount ($${amount}) exceeds remaining balance ($${remainingBalance.toFixed(2)})` 
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        treatmentId: parseInt(treatmentId),
        patientUserId: treatment.patientId,
        amount: parseFloat(amount),
        discount: parseFloat(discount),
        method: method.toUpperCase(),
        notes
      },
      include: {
        treatment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update treatment: 
    // - Discount reduces the total amount owed
    // - Payment amount increases what's been paid
    const updatedTreatment = await prisma.treatment.update({
      where: { id: parseInt(treatmentId) },
      data: {
        paidAmount: {
          increment: parseFloat(amount)
        },
        treatmentDiscount: {
          increment: parseFloat(discount)
        }
      },
      include: {
        patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({ 
      message: 'Payment recorded successfully', 
      payment,
      treatment: updatedTreatment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Update payment
router.put('/:id', authenticate, authorize('Dentist', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { amount, discount, method, notes } = req.body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        treatment: true
      }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check authorization
    if (userRole !== 'Admin' && existingPayment.treatment.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If amount or discount is being changed, adjust the treatment's paidAmount and treatmentDiscount
    const oldAmount = existingPayment.amount;
    const oldDiscount = existingPayment.discount;
    const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
    const newDiscount = discount !== undefined ? parseFloat(discount) : oldDiscount;
    
    // Calculate the differences
    const amountDifference = newAmount - oldAmount;
    const discountDifference = newDiscount - oldDiscount;
    
    if (amountDifference !== 0 || discountDifference !== 0) {
      // Update treatment: amount goes to paidAmount, discount reduces total amount owed
      await prisma.treatment.update({
        where: { id: existingPayment.treatmentId },
        data: {
          paidAmount: {
            increment: amountDifference
          },
          treatmentDiscount: {
            increment: discountDifference
          }
        }
      });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (discount !== undefined) updateData.discount = parseFloat(discount);
    if (method) updateData.method = method.toUpperCase();
    if (notes !== undefined) updateData.notes = notes;

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        treatment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({ 
      message: 'Payment updated successfully', 
      payment 
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', authenticate, authorize('Dentist', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        treatment: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check authorization
    if (userRole !== 'Admin' && payment.treatment.dentistId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update treatment paidAmount and treatmentDiscount before deleting payment
    await prisma.treatment.update({
      where: { id: payment.treatmentId },
      data: {
        paidAmount: {
          decrement: payment.amount
        },
        treatmentDiscount: {
          decrement: payment.discount
        }
      }
    });

    await prisma.payment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;
