'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { geoAitoff } from 'd3-geo-projection'

interface Point {
  name: string
  coordinates: [number, number]
}

export default function DymaxionMap() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 800
    const height = 600

    // Sample points
    const points: Point[] = [
      { name: 'New York', coordinates: [-74.006, 40.7128] },
      { name: 'London', coordinates: [-0.1276, 51.5074] },
      { name: 'Tokyo', coordinates: [139.6917, 35.6895] },
    ]

    const projection = geoAitoff()
      .scale(160)
      .translate([width / 2, height / 2])

    const path = d3.geoPath(projection)

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'black')
      .style('display', 'block')
      .style('margin', 'auto')

    // Clear any existing content
    svg.selectAll('*').remove()

    // Graticule (latitude/longitude lines)
    const graticule = d3.geoGraticule()

    svg.append('path')
      .datum(graticule())
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-opacity', 0.2)

    // Draw points
    svg.selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', d => projection(d.coordinates)![0])
      .attr('cy', d => projection(d.coordinates)![1])
      .attr('r', 5)
      .attr('fill', 'red')
      .append('title')
      .text(d => d.name)
  }, [])

  return <svg ref={svgRef}></svg>
}
