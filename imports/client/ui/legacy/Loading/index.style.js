export default theme => {
  return {
    root: {
      position: 'relative'
    },
    squares: {
      margin: '25% auto auto',
      width: '140px',
      height: '140px',
      borderRadius: '2px',
      opacity: '0.95'
    },
    square: {
      display: 'inline-block',
      verticalAlign: 'top',
      width: '20%',
      height: '20%',
      transitionDuration: '100ms'
    }
  }
}
