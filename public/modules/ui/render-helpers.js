/**
 * UI Render Helpers
 * Functions for generating HTML content and formatting display values
 */

/**
 * Create a stat card HTML element
 * @param {Object} config - Card configuration
 * @param {string} config.icon - Icon emoji or character
 * @param {string} config.label - Stat label
 * @param {string} config.value - Stat value to display
 * @param {string} config.trend - Trend indicator (up, down, neutral)
 * @param {string} config.className - Additional CSS classes
 * @returns {string} HTML string
 */
export function createStatCard({ icon, label, value, trend, className = "" }) {
  const trendClass = trend === "up" ? "positive" : trend === "down" ? "negative" : "";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return `
    <div class="stat-card ${className}">
      <span class="stat-icon">${icon}</span>
      <span class="stat-label">${label}</span>
      <span class="stat-value ${trendClass}">${value}${trendIcon ? ` ${trendIcon}` : ""}</span>
    </div>
  `;
}

/**
 * Create a progress bar HTML element
 * @param {Object} config - Progress bar configuration
 * @param {number} config.value - Current value
 * @param {number} config.max - Maximum value
 * @param {string} config.label - Label text
 * @param {string} config.colorClass - CSS class for color
 * @returns {string} HTML string
 */
export function createProgressBar({ value, max, label, colorClass = "" }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return `
    <div class="progress-bar-container">
      <div class="progress-bar-label">${label}</div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill ${colorClass}" style="width: ${percent}%"></div>
      </div>
      <div class="progress-bar-value">${percent.toFixed(0)}%</div>
    </div>
  `;
}

/**
 * Create a detail list item HTML
 * @param {Object} config - Item configuration
 * @param {string} config.icon - Icon emoji
 * @param {string} config.text - Main text
 * @param {string} config.value - Optional value
 * @param {string} config.valueClass - CSS class for value
 * @returns {string} HTML string
 */
export function createDetailItem({ icon, text, value, valueClass = "" }) {
  return `
    <li class="detail-item">
      <span class="detail-icon">${icon || "•"}</span>
      <span class="detail-text">${text}</span>
      ${value !== undefined ? `<span class="detail-value ${valueClass}">${value}</span>` : ""}
    </li>
  `;
}

/**
 * Format a number with appropriate suffix (K, M, B, T)
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
export function formatWithSuffix(num, decimals = 1) {
  if (num === undefined || num === null || isNaN(num)) return "-";
  if (Math.abs(num) < 1000) return num.toFixed(decimals);
  if (Math.abs(num) < 1000000) return (num / 1000).toFixed(decimals) + "K";
  if (Math.abs(num) < 1000000000) return (num / 1000000).toFixed(decimals) + "M";
  if (Math.abs(num) < 1000000000000) return (num / 1000000000).toFixed(decimals) + "B";
  return (num / 1000000000000).toFixed(decimals) + "T";
}

/**
 * Format CO2 emissions value
 * @param {number} emissions - Emissions in Gt CO2
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string with unit
 */
export function formatEmissions(emissions, decimals = 2) {
  if (emissions === undefined || emissions === null) return "-";
  if (Math.abs(emissions) < 0.001) return "0 Gt";
  if (Math.abs(emissions) < 1) return (emissions * 1000).toFixed(decimals) + " Mt";
  return emissions.toFixed(decimals) + " Gt";
}

/**
 * Format temperature with trend indicator
 * @param {number} temp - Temperature in Celsius
 * @param {number} baseline - Baseline temperature for comparison
 * @returns {Object} {value, trend, className}
 */
export function formatTemperature(temp, baseline = 1.2) {
  const value = `+${temp.toFixed(2)}°C`;
  let trend = "neutral";
  let className = "";

  if (temp < baseline - 0.05) {
    trend = "down";
    className = "temp-good";
  } else if (temp > baseline + 0.05) {
    trend = "up";
    className = temp > 1.5 ? "temp-bad" : "temp-warning";
  }

  return { value, trend, className };
}

/**
 * Format CO2 ppm with trend
 * @param {number} co2 - CO2 in ppm
 * @param {number} previousCo2 - Previous CO2 value
 * @returns {Object} {value, trend, className}
 */
export function formatCO2ppm(co2, previousCo2) {
  const value = `${co2.toFixed(1)} ppm`;
  let trend = "neutral";
  let className = "";

  if (previousCo2 !== undefined) {
    if (co2 < previousCo2 - 0.1) {
      trend = "down";
      className = "co2-good";
    } else if (co2 > previousCo2 + 0.1) {
      trend = "up";
      className = co2 > 450 ? "co2-bad" : "co2-warning";
    }
  }

  return { value, trend, className };
}

/**
 * Format power value with unit
 * @param {number} value - Power value in GW or TWh
 * @param {string} unit - Unit (GW, TWh)
 * @returns {string} Formatted string
 */
export function formatPower(value, unit = "GW") {
  if (value === undefined || value === null) return "-";
  if (Math.abs(value) < 1) return (value * 1000).toFixed(0) + " M" + unit.slice(0, 1);
  return value.toFixed(1) + " " + unit;
}

/**
 * Create tooltip HTML
 * @param {string} content - Tooltip content
 * @param {string} position - Position (top, bottom, left, right)
 * @returns {string} HTML string
 */
export function createTooltip(content, position = "top") {
  return `<span class="tooltip tooltip-${position}">${content}</span>`;
}

/**
 * Format percentage with color class
 * @param {number} value - Percentage value
 * @param {Object} thresholds - {good, warning, bad} threshold values
 * @returns {Object} {value, className}
 */
export function formatPercentWithClass(value, thresholds = { good: 80, warning: 50, bad: 30 }) {
  const formatted = `${value.toFixed(1)}%`;
  let className = "";

  if (value >= thresholds.good) {
    className = "percent-good";
  } else if (value >= thresholds.warning) {
    className = "percent-warning";
  } else {
    className = "percent-bad";
  }

  return { value: formatted, className };
}

/**
 * Create a badge/tag HTML element
 * @param {string} text - Badge text
 * @param {string} type - Badge type (success, warning, danger, info)
 * @returns {string} HTML string
 */
export function createBadge(text, type = "info") {
  return `<span class="badge badge-${type}">${text}</span>`;
}

/**
 * Format time remaining
 * @param {number} months - Months remaining
 * @returns {string} Formatted time string
 */
export function formatTimeRemaining(months) {
  if (months <= 0) return "Complete";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Create section header HTML
 * @param {string} title - Section title
 * @param {string} icon - Optional icon
 * @returns {string} HTML string
 */
export function createSectionHeader(title, icon = "") {
  return `
    <div class="section-header">
      ${icon ? `<span class="section-icon">${icon}</span>` : ""}
      <h3 class="section-title">${title}</h3>
    </div>
  `;
}

/**
 * Create expandable section HTML
 * @param {Object} config - Section configuration
 * @param {string} config.id - Section ID
 * @param {string} config.title - Section title
 * @param {string} config.icon - Section icon
 * @param {string} config.content - Section content HTML
 * @param {boolean} config.expanded - Initial expanded state
 * @returns {string} HTML string
 */
export function createExpandableSection({ id, title, icon, content, expanded = false }) {
  return `
    <div class="expandable-section ${expanded ? "expanded" : ""}" id="${id}">
      <button class="section-toggle" aria-expanded="${expanded}">
        ${icon ? `<span class="section-icon">${icon}</span>` : ""}
        <span class="section-title">${title}</span>
        <span class="toggle-icon">${expanded ? "▼" : "▶"}</span>
      </button>
      <div class="section-content" ${expanded ? "" : 'style="display: none"'}>
        ${content}
      </div>
    </div>
  `;
}

/**
 * Create data table HTML
 * @param {Object} config - Table configuration
 * @param {Array} config.headers - Column headers
 * @param {Array} config.rows - Row data (array of arrays)
 * @param {string} config.className - Additional CSS classes
 * @returns {string} HTML string
 */
export function createDataTable({ headers, rows, className = "" }) {
  const headerHtml = headers.map((h) => `<th>${h}</th>`).join("");
  const rowsHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");

  return `
    <table class="data-table ${className}">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create a comparison indicator (positive/negative)
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @param {boolean} invertColors - True if lower is better
 * @returns {Object} {text, className}
 */
export function createComparisonIndicator(current, previous, invertColors = false) {
  if (previous === undefined || previous === 0) {
    return { text: "", className: "" };
  }

  const diff = current - previous;
  const percent = ((diff / Math.abs(previous)) * 100).toFixed(1);
  const isPositive = diff > 0;
  const sign = isPositive ? "+" : "";

  let className = "";
  if (diff !== 0) {
    const isGood = invertColors ? !isPositive : isPositive;
    className = isGood ? "change-positive" : "change-negative";
  }

  return {
    text: `${sign}${percent}%`,
    className,
  };
}
