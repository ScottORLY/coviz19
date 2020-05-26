//Copyright © 2020 Scott Orlyck.

import styles from './styles.css'
import { select, selectAll, event } from 'd3-selection'
import { transition } from 'd3-transition'
import { easeLinear } from 'd3-ease'
import { timeParse } from 'd3-time-format'
import { timeDay } from 'd3-time'
import { scaleUtc } from 'd3-scale'
import { drag } from 'd3-drag'
import { axisBottom } from 'd3-axis'
import { extent } from 'd3-array'

const height = 50
const props = {
    width,
    height
}

const format = '%m-%d-%Y'
const parseDate = timeParse(format)
const jan = parseDate('1-22-2020')
const now = new Date()
const dates = timeDay.range(jan, now)
const width = dates.length * 6

const Slider = ({ attributes: { eventListener }}) => {

    const x = scaleUtc()
    .domain(extent(dates))
    .range([0, width])

    const svg = select(<svg {...props} />)

    const slider = svg.append(() => <g><line x1={x.range()[0]} x2={x.range()[1]} /></g>)
 
    slider.append(() => <g transform='translate(0, 20)'/>).call(axisBottom(x).ticks())
    const dragging = drag()
    dragging.container()
    slider.insert(() => <circle className={styles.overlay} r={9}/>)
        .call(drag()
        .on("drag", function() {
            select(this).attr('cx', () => {
                const value = event.x
                if (value < 0) { 
                    return 0 
                }
                if (value > width) {
                    return width
                }
                const tick = parseInt(value / 6)
                eventListener(tick)
                return value
            })
        }))
    return svg.node()
}

const Controls = () => {
    var counter = -1
    let state = 'pause'

    setInterval(() => {
        if (state == 'play' && counter <= dates.length) {
            counter++
            const t = transition().duration(500).ease(easeLinear)
            select('circle').transition(t).attr('cx', counter * 6)
            const detail = { detail: { t, counter }}
            window.dispatchEvent(new CustomEvent('tick', detail))
        }
        if (counter > dates.length) {
            state = 'pause'
            select(`.${styles.button}`).classed(styles.paused, state == 'play')
        }
    }, 500)

    return (
        <div id={styles.controls}>  
            <button 
                className={styles.button}
                eventListener={['click', function() {
                    state = state == 'play' ? 'pause' : 'play'
                    select(this).classed(styles.paused, state == 'play')
                }]}/>
            <Slider 
                eventListener={(value) => {
                    state = 'pause'
                    select(`.${styles.button}`).classed(styles.paused, state == 'play')
                    counter = value
                    const t = transition().ease(easeLinear)
                    const detail = { detail: { counter, t }}
                    window.dispatchEvent(new CustomEvent('tick', detail))
                }}/>
        </div>
    )
}

export default Controls