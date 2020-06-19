import React from "react"
import { ComponentProps, Streamlit, withStreamlitConnection } from "./streamlit"
import { isObject } from "lodash"

import echarts from "echarts"
import ReactEcharts from "echarts-for-react"

import deepMap from "./utils"

/**
 * Arguments Streamlit receives from the Python side
 */
interface PythonArgs {
  options: object
  theme: string | object
  height: string
  width: string
}

const EchartsChart = (props: ComponentProps) => {

  const JS_PLACEHOLDER = "--x_x--0_0--"

  const registerTheme = (themeProp: string | object) => {
    const customThemeName = "custom_theme"
    if (isObject(themeProp)) {
      echarts.registerTheme(customThemeName, themeProp)
    }
    return isObject(themeProp) ? customThemeName : themeProp
  }

  const convertJavascriptCode = (obj: object) => {
    let funcReg = new RegExp(`${JS_PLACEHOLDER}\\s*(function\\s*.*)\\s*${JS_PLACEHOLDER}`)

    // Look in all nested values of options for Pyecharts Javascript placeholder
    return deepMap(obj, function(v: string) {
      let match = funcReg.exec(v)
      if (match) {
        const funcStr = match[1]
        return new Function("return " + funcStr)()
      } else {
        return v
      }
    })
  }

  const { options, theme, height, width }: PythonArgs = props.args
  const cleanTheme = registerTheme(theme)
  const cleanOptions = convertJavascriptCode(options)

  return (
    <>
      <ReactEcharts
        option={cleanOptions}
        style={{ height: height, width: width }}
        theme={cleanTheme}
        onChartReady={() => {
          Streamlit.setFrameHeight()
        }}
      />
    </>
  )
}

export default withStreamlitConnection(EchartsChart)
