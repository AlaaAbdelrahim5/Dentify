/**
 * PaymentReceipt Component
 * Generates a professional printable payment receipt
 * Can be used across Patient, Dentist, and Secretary dashboards
 */

export const generatePaymentReceipt = (payment) => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt #${payment.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #0d9488; }
        .header h1 { font-size: 32px; color: #0d9488; margin-bottom: 8px; }
        .header p { color: #64748b; font-size: 14px; }
        .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
        .info-row { margin-bottom: 8px; }
        .info-label { font-size: 14px; color: #64748b; display: inline-block; width: 140px; }
        .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .invoice-table thead { background: #0d9488; color: white; }
        .invoice-table th { padding: 12px; text-align: left; font-weight: 600; font-size: 14px; }
        .invoice-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .invoice-table tbody tr:last-child td { border-bottom: none; }
        .discount-row { color: #f97316; font-style: italic; }
        .total-section { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .total { font-size: 20px; font-weight: bold; text-align: right; color: #0d9488; }
        .discount-note { font-size: 12px; color: #f97316; text-align: right; margin-top: 8px; }
        .notes { margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; }
        .notes strong { color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        button { margin-top: 30px; padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.3s; }
        button:hover { background: #0f766e; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PAYMENT RECEIPT</h1>
          <p>Receipt Number: #${payment.id}</p>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <h3>Clinic Information</h3>
            <div class="info-row">
              <span class="info-label">Clinic Name:</span>
              <span class="info-value">${payment.clinicName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Location:</span>
              <span class="info-value">${payment.clinicLocation || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date of Payment:</span>
              <span class="info-value">${new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          <div class="info-box">
            <h3>${payment.dentistName ? 'Provider & Patient Information' : 'Provider Information'}</h3>
            ${payment.dentistName ? `
            <div class="info-row">
              <span class="info-label">Dentist:</span>
              <span class="info-value">${payment.dentistName}</span>
            </div>
            ` : ''}
            ${payment.dentistSpecialization ? `
            <div class="info-row">
              <span class="info-label">Specialization:</span>
              <span class="info-value">${payment.dentistSpecialization}</span>
            </div>
            ` : ''}
            ${payment.patientName ? `
            <div class="info-row">
              <span class="info-label">Patient:</span>
              <span class="info-value">${payment.patientName}</span>
            </div>
            ` : ''}
            ${payment.paymentMethod ? `
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${payment.paymentMethod === 'CASH' ? 'Cash' : 'Card'}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              ${!payment.patientName ? '<th>Payment Method</th>' : ''}
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${payment.treatmentName}</strong></td>
              ${!payment.patientName ? `<td>${payment.paymentMethod === 'CASH' ? 'Cash' : 'Card'}</td>` : ''}
              <td style="text-align: right;">$${payment.amount.toFixed(2)}</td>
            </tr>
            ${payment.discount && payment.discount > 0 ? `
            <tr class="discount-row">
              <td>Discount Applied</td>
              ${!payment.patientName ? '<td></td>' : ''}
              <td style="text-align: right;">-$${payment.discount.toFixed(2)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total">Total Amount Paid: $${payment.amount.toFixed(2)}</div>
          ${payment.discount && payment.discount > 0 ? `<div class="discount-note">*Includes $${payment.discount.toFixed(2)} discount applied to treatment total</div>` : ''}
        </div>
        
        ${payment.notes ? `<div class="notes"><strong>Additional Notes:</strong> ${payment.notes}</div>` : ''}
        
        <div class="footer">
          <p>This is an official payment receipt. Please retain for your records.</p>
          <p>Thank you for your payment.</p>
        </div>
        
        <center>
          <button onclick="window.print()">Print Receipt</button>
        </center>
      </div>
    </body>
    </html>
  `)
  printWindow.document.close()
}

export default generatePaymentReceipt
