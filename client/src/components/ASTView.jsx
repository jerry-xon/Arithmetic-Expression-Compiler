import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

const OP_STYLE = {
  '+': { fill: '#1e1a3d', stroke: '#7c6aff', text: '#7c6aff' },
  '-': { fill: '#2d1a1a', stroke: '#ff6b6b', text: '#ff6b6b' },
  '*': { fill: '#1a2d2a', stroke: '#4ecdc4', text: '#4ecdc4' },
  '/': { fill: '#2d2a1a', stroke: '#ffd93d', text: '#ffd93d' },
  'unary-': { fill: '#2d1a1a', stroke: '#ff9f43', text: '#ff9f43' },
};

const NUM_STYLE = { fill: '#1a2a3d', stroke: '#4fc3f7', text: '#4fc3f7' };

// Flatten AST into a d3-hierarchy-friendly format
function flattenAST(node, id = { v: 0 }) {
  if (!node) return null;
  const myId = id.v++;
  const result = { id: myId, nodeType: node.type };

  if (node.type === 'NumberLiteral') {
    result.label = String(node.value);
    result.isLeaf = true;
    result.children = [];
  } else if (node.type === 'BinaryExpression') {
    result.label = node.operator;
    result.isLeaf = false;
    result.children = [
      flattenAST(node.left, id),
      flattenAST(node.right, id),
    ].filter(Boolean);
  } else if (node.type === 'UnaryExpression') {
    result.label = `-`;
    result.isLeaf = false;
    result.nodeType = 'UnaryExpression';
    result.children = [flattenAST(node.argument, id)].filter(Boolean);
  }

  return result;
}

export default function ASTView({ ast, visible }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    if (!ast || !visible || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 560;
    const H = 320;
    const MARGIN = { top: 30, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);

    const rootData = flattenAST(ast);
    const hierarchy = d3.hierarchy(rootData, d => d.children);

    const treeLayout = d3.tree()
      .size([W - MARGIN.left - MARGIN.right, H - MARGIN.top - MARGIN.bottom])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 2));

    treeLayout(hierarchy);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Draw edges first
    const links = g.append('g').attr('class', 'links');
    links.selectAll('path')
      .data(hierarchy.links())
      .enter()
      .append('path')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', function() { return this.getTotalLength(); })
      .attr('stroke-dashoffset', function() { return this.getTotalLength(); })
      .transition()
      .delay((_, i) => i * 80 + 100)
      .duration(400)
      .attr('stroke-dashoffset', 0);

    // Draw nodes
    const NODE_W = 52;
    const NODE_H = 34;

    const nodes = g.append('g').attr('class', 'nodes');
    const nodeGroups = nodes.selectAll('g')
      .data(hierarchy.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('cursor', 'pointer')
      .on('click', function(event, d) {
        setHighlighted(prev => prev === d.data.id ? null : d.data.id);
        event.stopPropagation();
      })
      .on('mouseenter', function(event, d) {
        const type = d.data.nodeType;
        const label = d.data.label;
        let detail = '';
        if (type === 'NumberLiteral') detail = `Numeric literal: ${label}`;
        else if (type === 'BinaryExpression') detail = `Binary operation: ${label}`;
        else if (type === 'UnaryExpression') detail = `Unary negation`;
        setTooltip({ x: event.offsetX, y: event.offsetY, label, type, detail });
        d3.select(this).select('rect').attr('filter', 'brightness(1.4)');
      })
      .on('mouseleave', function() {
        setTooltip(null);
        d3.select(this).select('rect').attr('filter', null);
      });

    // Background rect (initial invisible)
    nodeGroups.append('rect')
      .attr('x', -NODE_W / 2)
      .attr('y', -NODE_H / 2)
      .attr('width', NODE_W)
      .attr('height', NODE_H)
      .attr('rx', 8)
      .attr('fill', d => {
        if (d.data.isLeaf) return NUM_STYLE.fill;
        const s = OP_STYLE[d.data.label] || OP_STYLE['+'];
        return s.fill;
      })
      .attr('stroke', d => {
        if (d.data.isLeaf) return NUM_STYLE.stroke;
        const s = OP_STYLE[d.data.label] || OP_STYLE['+'];
        return s.stroke;
      })
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition()
      .delay((_, i) => i * 100 + 50)
      .duration(350)
      .attr('opacity', 1)
      .ease(d3.easeCubicOut);

    // Node label
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', d => d.data.isLeaf ? 13 : 16)
      .attr('font-weight', d => d.data.isLeaf ? 500 : 700)
      .attr('fill', d => {
        if (d.data.isLeaf) return NUM_STYLE.text;
        const s = OP_STYLE[d.data.label] || OP_STYLE['+'];
        return s.text;
      })
      .attr('opacity', 0)
      .text(d => d.data.label)
      .transition()
      .delay((_, i) => i * 100 + 150)
      .duration(250)
      .attr('opacity', 1);

    // Click on SVG background → deselect
    svg.on('click', () => setHighlighted(null));

  }, [ast, visible]);

  // Highlight effect: update rect stroke-width when highlighted changes
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll('rect')
      .attr('stroke-width', (d) => {
        if (!d) return 1.5;
        return d.data?.id === highlighted ? 3 : 1.5;
      })
      .attr('filter', d => {
        if (!d) return null;
        return d.data?.id === highlighted ? 'brightness(1.6) drop-shadow(0 0 6px currentColor)' : null;
      });
  }, [highlighted]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative"
    >
      <div className="panel-title">
        <div className="w-2 h-2 rounded-full bg-accent-teal" />
        Abstract Syntax Tree
        <span className="ml-auto text-[10px] text-text-muted normal-case tracking-normal">click nodes to highlight · hover for details</span>
      </div>
      <div className="p-2 relative" style={{ minHeight: 320 }}>
        <svg ref={svgRef} className="w-full" style={{ display: 'block' }} />

        {/* Tooltip */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs font-mono"
            style={{
              left: Math.min(tooltip.x + 12, 320),
              top: tooltip.y - 48,
              background: '#252a3a',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e8eaf6',
              maxWidth: 200,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div className="font-bold text-accent-purple">{tooltip.type}</div>
            <div className="text-text-secondary mt-0.5">{tooltip.detail}</div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {Object.entries(OP_STYLE).map(([op, s]) => (
          <div key={op} className="flex items-center gap-1.5 text-xs" style={{ color: s.text }}>
            <div className="w-3 h-3 rounded" style={{ background: s.fill, border: `1px solid ${s.stroke}` }} />
            {op === 'unary-' ? 'unary −' : `"${op}" node`}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: NUM_STYLE.text }}>
          <div className="w-3 h-3 rounded" style={{ background: NUM_STYLE.fill, border: `1px solid ${NUM_STYLE.stroke}` }} />
          number literal
        </div>
      </div>
    </motion.div>
  );
}
