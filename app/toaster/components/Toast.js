import React from 'react'

import { View, Text, Button } from '../../core/components'

const Toast = ({
  message,
  primaryButton,
  onPrimaryButtonPress,
  secondaryButton,
  onSecondaryButtonPress,
  onDismiss,
  isError
}) => {
  let toastStyles = styles.toast

  if (isError) {
    toastStyles = { ...toastStyles, ...styles.error }
  }

  return (
    <View style={toastStyles}>
      <Text style={styles.message}>
        {message}
      </Text>

      {secondaryButton && (
         <Button
             style={styles.button}
             textStyle={styles.buttonText}
             onPress={(e) => onSecondaryButtonPress(onDismiss, e)}
             secondary>
           {secondaryButton}
         </Button>
       )}

    {primaryButton && (
       <Button
           style={styles.button}
           textStyle={styles.buttonText}
           onPress={(e) => onPrimaryButtonPress(onDismiss, e)}>
         {primaryButton}
       </Button>
     )}
    </View>
  )
}

const styles = {
  toast: {
    borderRadius: 3,
    backgroundColor: 'rgb(100,200,100)',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20
  },
  error: {
    backgroundColor: 'rgb(225,50,50)'
  },
  message: {
    flex: 1,
    color: 'white',
    fontFamily: 'futura',
    fontSize: 14,
    marginRight: 20
  },
  button: {
    marginTop: -4,
    marginBottom: -4
  },
  buttonText: {
    fontSize: 12,
    textTransform: 'uppercase'
  }
}

export default Toast