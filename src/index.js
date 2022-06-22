import React from 'react'
import styles from './styles.module.css'
import { ToolComponent } from './Tool'

export { ToolComponent }

export const ExampleComponent = ({ text }) => {
  return <div className={styles.test}>Example Component: {text}</div>
}

export const AppComponent = ({ text }) => {
  return <div className={styles.test}>Example Component: {text}</div>
}
