import React from "react"
import { Text } from "react-native"

type TypographyProps={
    text?:string,
    color?:string,
 
    style?:object,
    
}


export const Typography=({text,color,style}:TypographyProps)=>{
   return(
    <Text style={[{color},style]}>{text}</Text>
   )
}