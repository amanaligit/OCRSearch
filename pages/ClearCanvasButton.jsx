import React from 'react'
import { useCanvas } from './CanvasContext'
import { Button } from '@mantine/core';


export const ClearCanvasButton = () => {
  const { clearCanvas } = useCanvas()

  
  return (
    <Button onClick={clearCanvas} style={{position: 'absolute', right: '10px', top: '10px', backgroundColor:'red'} }> Clear Canvas</Button>)
  // <button onClick={clearCanvas} >Clear Canvas</button>)
}