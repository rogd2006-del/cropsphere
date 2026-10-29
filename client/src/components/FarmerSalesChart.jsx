import React from 'react';

const CHART_WIDTH = 860;
const CHART_HEIGHT = 280;
const PLOT = { top: 20, right: 20, bottom: 42, left: 70 };

const formatCurrency = (value, compact = false) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: compact ? 0 : 2,
  ...(compact ? { notation: 'compact' } : {}),
}).format(value);

export default function FarmerSalesChart({ sales = [], endDate, loading = false }) {
  const salesByDate = new Map(
    (Array.isArray(sales) ? sales : [])
      .filter((item) => item && typeof item._id === 'string')
      .map((item) => [item._id.slice(0, 10), item])
  );
  const end = endDate ? new Date(`${endDate}T00:00:00Z`) : null;
  const days = end && !Number.isNaN(end.getTime())
    ? Array.from({ length: 30 }, (_, index) => {
      const date = new Date(end);
      date.setUTCDate(date.getUTCDate() - (29 - index));
      const dateKey = date.toISOString().slice(0, 10);
      const entry = salesByDate.get(dateKey);

      return {
        date,
        dateKey,
        revenue: Number.isFinite(Number(entry?.revenue)) ? Number(entry.revenue) : 0,
        orders: Number.isFinite(Number(entry?.orders)) ? Number(entry.orders) : 0,
      };
    })
    : [];

  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const maxRevenue = Math.max(...days.map((day) => day.revenue), 0);
  const hasSales = maxRevenue > 0;
  const chartMax = maxRevenue > 0 ? maxRevenue * 1.15 : 1;
  const points = days.map((day, index) => ({
    ...day,
    x: PLOT.left + (index / (days.length - 1)) * plotWidth,
    y: PLOT.top + plotHeight - (day.revenue / chartMax) * plotHeight,
  }));
  const linePath = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  const areaPath = hasSales
    ? `${linePath} L ${points[points.length - 1].x} ${PLOT.top + plotHeight} L ${points[0].x} ${PLOT.top + plotHeight} Z`
    : '';
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const value = chartMax * (1 - index / 4);
    return {
      y: PLOT.top + (index / 4) * plotHeight,
      label: formatCurrency(hasSales ? value : 0, true),
    };
  });
  const dateLabels = points.length
    ? [0, 7, 14, 21, 29].map((index) => points[index])
    : [];

  return (
    <section className="card" aria-labelledby="farmer-sales-title" style={{ marginBottom: '28px', padding: '24px 24px 16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              display: 'grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              color: 'var(--amazon-700)',
              background: 'var(--amazon-50)'
            }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-5 5" />
              </svg>
            </div>
            <h2 id="farmer-sales-title" style={{ fontSize: '18px', fontWeight: 800 }}>
              Sales overview
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Daily revenue for the last 30 days
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--amazon-900)', fontSize: '20px', fontWeight: 800 }}>
            {formatCurrency(days.reduce((total, day) => total + day.revenue, 0))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {days.reduce((total, day) => total + day.orders, 0)} orders in this period
          </div>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          role="img"
          aria-label={`Daily sales revenue over the last 30 days. ${loading ? 'Loading sales data.' : hasSales ? `Peak daily revenue ${formatCurrency(maxRevenue)}.` : 'No sales recorded in this period.'}`}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          style={{ display: 'block', width: '100%', minWidth: '560px', height: 'auto' }}
        >
          <defs>
            <linearGradient id="farmer-sales-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--amazon-500)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--amazon-500)" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {ticks.map((tick, index) => (
            <g key={tick.y}>
              <line
                x1={PLOT.left}
                x2={CHART_WIDTH - PLOT.right}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--border-subtle)"
                strokeDasharray={index === 4 ? undefined : '4 5'}
              />
              <text x={PLOT.left - 12} y={tick.y + 4} textAnchor="end" fill="var(--text-light)" fontSize="11">
                {tick.label}
              </text>
            </g>
          ))}
          {hasSales && (
            <>
              <path d={areaPath} fill="url(#farmer-sales-fill)" />
              <path d={linePath} fill="none" stroke="var(--amazon-600)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {points.filter((point) => point.revenue > 0).map((point) => (
                <circle key={point.dateKey} cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke="var(--amazon-600)" strokeWidth="2">
                  <title>{`${point.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })}: ${formatCurrency(point.revenue)} from ${point.orders} orders`}</title>
                </circle>
              ))}
            </>
          )}
          {dateLabels.map((point) => (
            <text
              key={point.dateKey}
              x={point.x}
              y={CHART_HEIGHT - 12}
              textAnchor={point === dateLabels[0] ? 'start' : point === dateLabels[dateLabels.length - 1] ? 'end' : 'middle'}
              fill="var(--text-light)"
              fontSize="11"
            >
              {point.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
            </text>
          ))}
          {!hasSales && (
            <text x={PLOT.left + plotWidth / 2} y={PLOT.top + plotHeight / 2} textAnchor="middle" fill="var(--text-muted)" fontSize="13">
              {loading ? 'Loading sales data...' : 'No sales in the last 30 days'}
            </text>
          )}
        </svg>
      </div>
    </section>
  );
}
