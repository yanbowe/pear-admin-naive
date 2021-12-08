import { Chart, registerAnimation } from '@antv/g2'

export function renderDynamicChart(chart: Chart, data: any) {
  chart.clear()
  clearChartInterval()
  function clearChartInterval() {
    if (window['interval']) {
      clearInterval(window['interval'])
    }
  }
  registerAnimation('label-appear', (element, animateCfg, cfg) => {
    let label
    if ('getChildren' in element) {
      label = element.getChildren()[0]
    }
    const coordinate = cfg.coordinate
    const startX = coordinate.start.x
    const finalX = label.attr('x')
    const labelContent = label.attr('text')

    label.attr('x', startX)
    label.attr('text', 0)

    const distance = finalX - startX
    label.animate((ratio) => {
      const position = startX + distance * ratio
      const text = (labelContent * ratio).toFixed(0)

      return {
        x: position,
        text
      }
    }, animateCfg)
  })

  registerAnimation('label-update', (element, animateCfg, cfg) => {
    const startX = element.attr('x')
    const startY = element.attr('y')
    // @ts-ignore
    const finalX = cfg.toAttrs.x
    // @ts-ignore
    const finalY = cfg.toAttrs.y
    const labelContent = element.attr('text')
    // @ts-ignore
    const finalContent = cfg.toAttrs.text

    const distanceX = finalX - startX
    const distanceY = finalY - startY
    const numberDiff = +finalContent - +labelContent

    element.animate((ratio) => {
      const positionX = startX + distanceX * ratio
      const positionY = startY + distanceY * ratio
      const text = (+labelContent + numberDiff * ratio).toFixed(0)

      return {
        x: positionX,
        y: positionY,
        text
      }
    }, animateCfg)
  })

  function handleData(source) {
    source.sort((a, b) => {
      return a.value - b.value
    })

    return source
  }

  let count = 0
  // let interval: any = undefined
  window['interval'] = undefined

  // if (interval) {
  //   console.log('clear interval ')
  //   clearInterval(interval)
  // }

  function countUp() {
    if (count === 0) {
      // @ts-ignore
      chart.data(handleData(Object.values(data)[count]))
      chart.coordinate('rect').transpose()
      chart.legend(false)
      chart.tooltip(false)
      // chart.axis('value', false);
      chart.axis('city', {
        animateOption: {
          update: {
            duration: 1000,
            easing: 'easeLinear'
          }
        }
      })
      chart.annotation().text({
        position: ['95%', '90%'],
        content: Object.keys(data)[count],
        style: {
          fontSize: 40,
          fontWeight: 'bold',
          fill: '#ddd',
          textAlign: 'end'
        },
        animate: false
      })
      chart
        .interval()
        .position('city*value')
        .color('city')
        .label('value', () => {
          // if (value !== 0) {
          return {
            animate: {
              appear: {
                animation: 'label-appear',
                delay: 0,
                duration: 1000,
                easing: 'easeLinear'
              },
              update: {
                animation: 'label-update',
                duration: 1000,
                easing: 'easeLinear'
              }
            },
            offset: 5
          }
          // }
        })
        .animate({
          appear: {
            duration: 1000,
            easing: 'easeLinear'
          },
          update: {
            duration: 1000,
            easing: 'easeLinear'
          }
        })
      chart.forceFit()
      chart.render()
    } else {
      chart.annotation().clear(true)
      chart.annotation().text({
        position: ['95%', '90%'],
        content: Object.keys(data)[count],
        style: {
          fontSize: 40,
          fontWeight: 'bold',
          fill: '#ddd',
          textAlign: 'end'
        },
        animate: false
      })
      // @ts-ignore
      chart.changeData(handleData(Object.values(data)[count]))
    }

    ++count

    if (count === Object.keys(data).length) {
      clearInterval(window['interval'])
    }
  }

  countUp()
  window['interval'] = setInterval(countUp, 1200)
}
