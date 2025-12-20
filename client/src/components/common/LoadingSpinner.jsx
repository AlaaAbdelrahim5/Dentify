// LoadingSpinner is now consolidated into LoadingState
// This file re-exports LoadingState for backward compatibility
import LoadingState from './LoadingState'

const LoadingSpinner = (props) => {
  return <LoadingState {...props} centered={false} />
}

export default LoadingSpinner