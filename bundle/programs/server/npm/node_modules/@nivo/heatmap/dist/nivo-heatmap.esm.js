import React, { Component } from 'react';
import partial from 'lodash/partial';
import { TransitionMotion } from 'react-motion';
import { quantizeColorScalePropType, noop, withTheme, withDimensions, withMotion, guessQuantizeColorScale, getAccessorFor, themePropType, Container, SvgWrapper, getRelativeCursor, isCursorInRect, ResponsiveWrapper } from '@nivo/core';
import { inheritedColorPropType, getInheritedColorGenerator, interpolateColor, getInterpolatedColor } from '@nivo/colors';
import { axisPropType, Grid, Axes, renderAxesToCanvas } from '@nivo/axes';
import setDisplayName from 'recompose/setDisplayName';
import PropTypes from 'prop-types';
import min from 'lodash/min';
import max from 'lodash/max';
import isEqual from 'lodash/isEqual';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import withState from 'recompose/withState';
import pure from 'recompose/pure';
import { scaleOrdinal, scaleLinear } from 'd3-scale';
import { BasicTooltip } from '@nivo/tooltip';

var HeatMapPropTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  indexBy: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  getIndex: PropTypes.func.isRequired,
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  minValue: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number]).isRequired,
  maxValue: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number]).isRequired,
  forceSquare: PropTypes.bool.isRequired,
  sizeVariation: PropTypes.number.isRequired,
  padding: PropTypes.number.isRequired,
  cellShape: PropTypes.oneOfType([PropTypes.oneOf(['rect', 'circle']), PropTypes.func]).isRequired,
  cellOpacity: PropTypes.number.isRequired,
  cellBorderWidth: PropTypes.number.isRequired,
  cellBorderColor: inheritedColorPropType.isRequired,
  getCellBorderColor: PropTypes.func.isRequired,
  axisTop: axisPropType,
  axisRight: axisPropType,
  axisBottom: axisPropType,
  axisLeft: axisPropType,
  enableGridX: PropTypes.bool.isRequired,
  enableGridY: PropTypes.bool.isRequired,
  enableLabels: PropTypes.bool.isRequired,
  labelTextColor: inheritedColorPropType.isRequired,
  getLabelTextColor: PropTypes.func.isRequired,
  colors: quantizeColorScalePropType.isRequired,
  colorScale: PropTypes.func.isRequired,
  nanColor: PropTypes.string,
  isInteractive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  hoverTarget: PropTypes.oneOf(['cell', 'row', 'column', 'rowColumn']).isRequired,
  cellHoverOpacity: PropTypes.number.isRequired,
  cellHoverOthersOpacity: PropTypes.number.isRequired,
  tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  tooltip: PropTypes.func,
  pixelRatio: PropTypes.number.isRequired
};
var HeatMapDefaultProps = {
  indexBy: 'id',
  minValue: 'auto',
  maxValue: 'auto',
  forceSquare: false,
  sizeVariation: 0,
  padding: 0,
  cellShape: 'rect',
  cellOpacity: 0.85,
  cellBorderWidth: 0,
  cellBorderColor: {
    from: 'color'
  },
  axisTop: {},
  axisLeft: {},
  enableGridX: false,
  enableGridY: false,
  enableLabels: true,
  labelTextColor: {
    from: 'color',
    modifiers: [['darker', 1.4]]
  },
  colors: 'nivo',
  nanColor: '#000000',
  isInteractive: true,
  onClick: noop,
  hoverTarget: 'rowColumn',
  cellHoverOpacity: 1,
  cellHoverOthersOpacity: 0.35,
  pixelRatio: global.window && global.window.devicePixelRatio ? global.window.devicePixelRatio : 1
};

var isHoverTargetByType = {
  cell: function cell(node, current) {
    return node.xKey === current.xKey && node.yKey === current.yKey;
  },
  row: function row(node, current) {
    return node.yKey === current.yKey;
  },
  column: function column(node, current) {
    return node.xKey === current.xKey;
  },
  rowColumn: function rowColumn(node, current) {
    return node.xKey === current.xKey || node.yKey === current.yKey;
  }
};
var computeNodes = (function (_ref) {
  var data = _ref.data,
      keys = _ref.keys,
      getIndex = _ref.getIndex,
      xScale = _ref.xScale,
      yScale = _ref.yScale,
      sizeScale = _ref.sizeScale,
      cellOpacity = _ref.cellOpacity,
      cellWidth = _ref.cellWidth,
      cellHeight = _ref.cellHeight,
      colorScale = _ref.colorScale,
      nanColor = _ref.nanColor,
      getLabelTextColor = _ref.getLabelTextColor,
      currentNode = _ref.currentNode,
      hoverTarget = _ref.hoverTarget,
      cellHoverOpacity = _ref.cellHoverOpacity,
      cellHoverOthersOpacity = _ref.cellHoverOthersOpacity;
  var isHoverTarget = isHoverTargetByType[hoverTarget];
  return data.reduce(function (acc, d) {
    keys.forEach(function (key) {
      var width = sizeScale ? Math.min(sizeScale(d[key]) * cellWidth, cellWidth) : cellWidth;
      var height = sizeScale ? Math.min(sizeScale(d[key]) * cellHeight, cellHeight) : cellHeight;
      var node = {
        key: "".concat(key, ".").concat(getIndex(d)),
        xKey: key,
        yKey: getIndex(d),
        x: xScale(key),
        y: yScale(getIndex(d)),
        width: width,
        height: height,
        value: d[key],
        color: isNaN(d[key]) ? nanColor : colorScale(d[key])
      };
      var opacity = cellOpacity;
      if (currentNode) {
        opacity = isHoverTarget(node, currentNode) ? cellHoverOpacity : cellHoverOthersOpacity;
      }
      acc.push(Object.assign(node, {
        labelTextColor: getLabelTextColor(node),
        opacity: opacity
      }));
    });
    return acc;
  }, []);
});

var computeX = function computeX(column, cellWidth, padding) {
  return column * cellWidth + cellWidth * 0.5 + padding * column + padding;
};
var computeY = function computeY(row, cellHeight, padding) {
  return row * cellHeight + cellHeight * 0.5 + padding * row + padding;
};
var enhance = (function (Component) {
  return compose(defaultProps(HeatMapDefaultProps), withState('currentNode', 'setCurrentNode', null), withTheme(), withDimensions(), withMotion(), withPropsOnChange(['colors'], function (_ref) {
    var colors = _ref.colors;
    return {
      colorScale: guessQuantizeColorScale(colors)
    };
  }), withPropsOnChange(['indexBy'], function (_ref2) {
    var indexBy = _ref2.indexBy;
    return {
      getIndex: getAccessorFor(indexBy)
    };
  }), withPropsOnChange(['data', 'keys', 'width', 'height', 'padding', 'forceSquare'], function (_ref3) {
    var data = _ref3.data,
        keys = _ref3.keys,
        width = _ref3.width,
        height = _ref3.height,
        padding = _ref3.padding,
        forceSquare = _ref3.forceSquare;
    var columns = keys.length;
    var rows = data.length;
    var cellWidth = Math.max((width - padding * (columns + 1)) / columns, 0);
    var cellHeight = Math.max((height - padding * (rows + 1)) / rows, 0);
    var offsetX = 0;
    var offsetY = 0;
    if (forceSquare === true) {
      var cellSize = Math.min(cellWidth, cellHeight);
      cellWidth = cellSize;
      cellHeight = cellSize;
      offsetX = (width - ((cellWidth + padding) * columns + padding)) / 2;
      offsetY = (height - ((cellHeight + padding) * rows + padding)) / 2;
    }
    return {
      cellWidth: cellWidth,
      cellHeight: cellHeight,
      offsetX: offsetX,
      offsetY: offsetY
    };
  }), withPropsOnChange(['data', 'getIndex'], function (_ref4) {
    var data = _ref4.data,
        getIndex = _ref4.getIndex;
    return {
      indices: data.map(getIndex)
    };
  }), withPropsOnChange(function (prev, next) {
    return prev.keys !== next.keys || prev.cellWidth !== next.cellWidth || prev.cellHeight !== next.cellHeight || prev.padding !== next.padding || !isEqual(prev.indices, next.indices);
  }, function (_ref5) {
    var indices = _ref5.indices,
        keys = _ref5.keys,
        cellWidth = _ref5.cellWidth,
        cellHeight = _ref5.cellHeight,
        padding = _ref5.padding;
    return {
      xScale: scaleOrdinal(keys.map(function (key, i) {
        return computeX(i, cellWidth, padding);
      })).domain(keys),
      yScale: scaleOrdinal(indices.map(function (d, i) {
        return computeY(i, cellHeight, padding);
      })).domain(indices)
    };
  }), withPropsOnChange(['data', 'keys', 'minValue', 'maxValue'], function (_ref6) {
    var data = _ref6.data,
        keys = _ref6.keys,
        _minValue = _ref6.minValue,
        _maxValue = _ref6.maxValue;
    var minValue = _minValue;
    var maxValue = _maxValue;
    if (minValue === 'auto' || maxValue === 'auto') {
      var allValues = data.reduce(function (acc, row) {
        return acc.concat(keys.map(function (key) {
          return row[key];
        }));
      }, []);
      if (minValue === 'auto') minValue = min(allValues);
      if (maxValue === 'auto') maxValue = max(allValues);
    }
    return {
      minValue: Math.min(minValue, maxValue),
      maxValue: Math.max(maxValue, minValue)
    };
  }), withPropsOnChange(['colorScale', 'minValue', 'maxValue'], function (_ref7) {
    var colorScale = _ref7.colorScale,
        minValue = _ref7.minValue,
        maxValue = _ref7.maxValue;
    return {
      colorScale: colorScale.domain([minValue, maxValue])
    };
  }), withPropsOnChange(['sizeVariation', 'minValue', 'maxValue'], function (_ref8) {
    var sizeVariation = _ref8.sizeVariation,
        minValue = _ref8.minValue,
        maxValue = _ref8.maxValue;
    var sizeScale;
    if (sizeVariation > 0) {
      sizeScale = scaleLinear().range([1 - sizeVariation, 1]).domain([minValue, maxValue]);
    }
    return {
      sizeScale: sizeScale
    };
  }), withPropsOnChange(['cellBorderColor', 'theme'], function (_ref9) {
    var cellBorderColor = _ref9.cellBorderColor,
        theme = _ref9.theme;
    return {
      getCellBorderColor: getInheritedColorGenerator(cellBorderColor, theme)
    };
  }), withPropsOnChange(['labelTextColor', 'theme'], function (_ref10) {
    var labelTextColor = _ref10.labelTextColor,
        theme = _ref10.theme;
    return {
      getLabelTextColor: getInheritedColorGenerator(labelTextColor, theme)
    };
  }), pure)(Component);
});

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var style = {
  cursor: 'pointer'
};
var HeatMapCellRect = function HeatMapCellRect(_ref) {
  var data = _ref.data,
      value = _ref.value,
      x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      color = _ref.color,
      opacity = _ref.opacity,
      borderWidth = _ref.borderWidth,
      borderColor = _ref.borderColor,
      enableLabel = _ref.enableLabel,
      textColor = _ref.textColor,
      onHover = _ref.onHover,
      onLeave = _ref.onLeave,
      _onClick = _ref.onClick,
      theme = _ref.theme;
  return React.createElement("g", {
    transform: "translate(".concat(x, ", ").concat(y, ")"),
    onMouseEnter: onHover,
    onMouseMove: onHover,
    onMouseLeave: onLeave,
    onClick: function onClick(e) {
      _onClick(data, e);
    },
    style: style
  }, React.createElement("rect", {
    x: width * -0.5,
    y: height * -0.5,
    width: width,
    height: height,
    fill: color,
    fillOpacity: opacity,
    strokeWidth: borderWidth,
    stroke: borderColor,
    strokeOpacity: opacity
  }), enableLabel && React.createElement("text", {
    dominantBaseline: "central",
    textAnchor: "middle",
    style: _objectSpread({}, theme.labels.text, {
      fill: textColor
    }),
    fillOpacity: opacity
  }, value));
};
HeatMapCellRect.propTypes = {
  data: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  borderWidth: PropTypes.number.isRequired,
  borderColor: PropTypes.string.isRequired,
  enableLabel: PropTypes.bool.isRequired,
  textColor: PropTypes.string.isRequired,
  onHover: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  theme: themePropType.isRequired
};
var HeatMapCellRect$1 = pure(HeatMapCellRect);

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$1(target, key, source[key]); }); } return target; }
function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var style$1 = {
  cursor: 'pointer'
};
var HeatMapCellCircle = function HeatMapCellCircle(_ref) {
  var data = _ref.data,
      value = _ref.value,
      x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      color = _ref.color,
      opacity = _ref.opacity,
      borderWidth = _ref.borderWidth,
      borderColor = _ref.borderColor,
      enableLabel = _ref.enableLabel,
      textColor = _ref.textColor,
      onHover = _ref.onHover,
      onLeave = _ref.onLeave,
      _onClick = _ref.onClick,
      theme = _ref.theme;
  return React.createElement("g", {
    transform: "translate(".concat(x, ", ").concat(y, ")"),
    style: style$1,
    onMouseEnter: onHover,
    onMouseMove: onHover,
    onMouseLeave: onLeave,
    onClick: function onClick(e) {
      _onClick(data, e);
    }
  }, React.createElement("circle", {
    r: Math.min(width, height) / 2,
    fill: color,
    fillOpacity: opacity,
    strokeWidth: borderWidth,
    stroke: borderColor,
    strokeOpacity: opacity
  }), enableLabel && React.createElement("text", {
    dominantBaseline: "central",
    textAnchor: "middle",
    style: _objectSpread$1({}, theme.labels, {
      fill: textColor
    }),
    fillOpacity: opacity
  }, value));
};
HeatMapCellCircle.propTypes = {
  data: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  borderWidth: PropTypes.number.isRequired,
  borderColor: PropTypes.string.isRequired,
  enableLabel: PropTypes.bool.isRequired,
  textColor: PropTypes.string.isRequired,
  onHover: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  theme: themePropType.isRequired
};
var HeatMapCellCircle$1 = pure(HeatMapCellCircle);

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } return target; }
function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var HeatMapCellTooltip = function HeatMapCellTooltip(_ref) {
  var node = _ref.node,
      theme = _ref.theme,
      format = _ref.format,
      tooltip = _ref.tooltip;
  return React.createElement(BasicTooltip, {
    id: "".concat(node.yKey, " - ").concat(node.xKey),
    value: node.value,
    enableChip: true,
    color: node.color,
    theme: theme,
    format: format,
    renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _objectSpread$2({}, node)) : null
  });
};
HeatMapCellTooltip.propTypes = {
  node: PropTypes.shape({
    xKey: PropTypes.string.isRequired,
    yKey: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
  }).isRequired,
  format: PropTypes.func,
  tooltip: PropTypes.func,
  theme: PropTypes.shape({
    tooltip: PropTypes.shape({
      container: PropTypes.object.isRequired,
      basic: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};
var HeatMapCellTooltip$1 = pure(HeatMapCellTooltip);

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$3(target, key, source[key]); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty$3(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var HeatMap =
function (_Component) {
  _inherits(HeatMap, _Component);
  function HeatMap() {
    var _getPrototypeOf2;
    var _this;
    _classCallCheck(this, HeatMap);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(HeatMap)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _defineProperty$3(_assertThisInitialized(_this), "handleNodeHover", function (showTooltip, node, event) {
      var _this$props = _this.props,
          setCurrentNode = _this$props.setCurrentNode,
          theme = _this$props.theme,
          tooltipFormat = _this$props.tooltipFormat,
          tooltip = _this$props.tooltip;
      setCurrentNode(node);
      showTooltip(React.createElement(HeatMapCellTooltip$1, {
        node: node,
        theme: theme,
        format: tooltipFormat,
        tooltip: tooltip
      }), event);
    });
    _defineProperty$3(_assertThisInitialized(_this), "handleNodeLeave", function (hideTooltip) {
      _this.props.setCurrentNode(null);
      hideTooltip();
    });
    return _this;
  }
  _createClass(HeatMap, [{
    key: "render",
    value: function render() {
      var _this2 = this;
      var _this$props2 = this.props,
          xScale = _this$props2.xScale,
          yScale = _this$props2.yScale,
          offsetX = _this$props2.offsetX,
          offsetY = _this$props2.offsetY,
          margin = _this$props2.margin,
          width = _this$props2.width,
          height = _this$props2.height,
          outerWidth = _this$props2.outerWidth,
          outerHeight = _this$props2.outerHeight,
          cellShape = _this$props2.cellShape,
          cellBorderWidth = _this$props2.cellBorderWidth,
          getCellBorderColor = _this$props2.getCellBorderColor,
          axisTop = _this$props2.axisTop,
          axisRight = _this$props2.axisRight,
          axisBottom = _this$props2.axisBottom,
          axisLeft = _this$props2.axisLeft,
          enableGridX = _this$props2.enableGridX,
          enableGridY = _this$props2.enableGridY,
          enableLabels = _this$props2.enableLabels,
          getLabelTextColor = _this$props2.getLabelTextColor,
          theme = _this$props2.theme,
          animate = _this$props2.animate,
          motionStiffness = _this$props2.motionStiffness,
          motionDamping = _this$props2.motionDamping,
          boundSpring = _this$props2.boundSpring,
          isInteractive = _this$props2.isInteractive,
          onClick = _this$props2.onClick;
      var Cell;
      if (cellShape === 'rect') {
        Cell = HeatMapCellRect$1;
      } else if (cellShape === 'circle') {
        Cell = HeatMapCellCircle$1;
      } else {
        Cell = cellShape;
      }
      var nodes = computeNodes(this.props);
      return React.createElement(Container, {
        isInteractive: isInteractive,
        theme: theme,
        animate: animate,
        motionDamping: motionDamping,
        motionStiffness: motionStiffness
      }, function (_ref) {
        var showTooltip = _ref.showTooltip,
            hideTooltip = _ref.hideTooltip;
        var onHover = partial(_this2.handleNodeHover, showTooltip);
        var onLeave = partial(_this2.handleNodeLeave, hideTooltip);
        return React.createElement(SvgWrapper, {
          width: outerWidth,
          height: outerHeight,
          margin: Object.assign({}, margin, {
            top: margin.top + offsetY,
            left: margin.left + offsetX
          }),
          theme: theme
        }, React.createElement(Grid, {
          width: width - offsetX * 2,
          height: height - offsetY * 2,
          xScale: enableGridX ? xScale : null,
          yScale: enableGridY ? yScale : null
        }), React.createElement(Axes, {
          xScale: xScale,
          yScale: yScale,
          width: width,
          height: height,
          top: axisTop,
          right: axisRight,
          bottom: axisBottom,
          left: axisLeft
        }), !animate && nodes.map(function (node) {
          return React.createElement(Cell, {
            key: node.key,
            data: node,
            value: node.value,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            color: node.color,
            opacity: node.opacity,
            borderWidth: cellBorderWidth,
            borderColor: getCellBorderColor(node),
            enableLabel: enableLabels,
            textColor: getLabelTextColor(node),
            onHover: partial(onHover, node),
            onLeave: onLeave,
            onClick: onClick,
            theme: theme
          });
        }), animate === true && React.createElement(TransitionMotion, {
          styles: nodes.map(function (node) {
            return {
              key: node.key,
              data: node,
              style: _objectSpread$3({
                x: boundSpring(node.x),
                y: boundSpring(node.y),
                width: boundSpring(node.width),
                height: boundSpring(node.height),
                opacity: boundSpring(node.opacity)
              }, interpolateColor(node.color, {
                damping: motionDamping,
                stiffness: motionStiffness
              }))
            };
          })
        }, function (interpolatedStyles) {
          return React.createElement("g", null, interpolatedStyles.map(function (_ref2) {
            var key = _ref2.key,
                style = _ref2.style,
                node = _ref2.data;
            var color = getInterpolatedColor(style);
            return React.createElement(Cell, {
              key: key,
              data: node,
              value: node.value,
              x: style.x,
              y: style.y,
              width: Math.max(style.width, 0),
              height: Math.max(style.height, 0),
              color: color,
              opacity: style.opacity,
              borderWidth: cellBorderWidth,
              borderColor: getCellBorderColor(_objectSpread$3({}, node, {
                color: color
              })),
              enableLabel: enableLabels,
              textColor: getLabelTextColor(_objectSpread$3({}, node, {
                color: color
              })),
              onHover: partial(onHover, node),
              onLeave: onLeave,
              onClick: onClick,
              theme: theme
            });
          }));
        }));
      });
    }
  }]);
  return HeatMap;
}(Component);
_defineProperty$3(HeatMap, "propTypes", HeatMapPropTypes);
var HeatMap$1 = setDisplayName('HeatMap')(enhance(HeatMap));

var renderRect = function renderRect(ctx, _ref, _ref2) {
  var enableLabels = _ref.enableLabels,
      theme = _ref.theme;
  var x = _ref2.x,
      y = _ref2.y,
      width = _ref2.width,
      height = _ref2.height,
      color = _ref2.color,
      opacity = _ref2.opacity,
      labelTextColor = _ref2.labelTextColor,
      value = _ref2.value;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  if (enableLabels === true) {
    ctx.fillStyle = labelTextColor;
    ctx.font = "".concat(theme.labels.text.fontSize, "px ").concat(theme.labels.text.fontFamily);
    ctx.fillText(value, x, y);
  }
  ctx.restore();
};
var renderCircle = function renderCircle(ctx, _ref3, _ref4) {
  var enableLabels = _ref3.enableLabels,
      theme = _ref3.theme;
  var x = _ref4.x,
      y = _ref4.y,
      width = _ref4.width,
      height = _ref4.height,
      color = _ref4.color,
      opacity = _ref4.opacity,
      labelTextColor = _ref4.labelTextColor,
      value = _ref4.value;
  ctx.save();
  ctx.globalAlpha = opacity;
  var radius = Math.min(width, height) / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  if (enableLabels === true) {
    ctx.fillStyle = labelTextColor;
    ctx.font = "".concat(theme.labels.text.fontSize, "px ").concat(theme.labels.text.fontFamily);
    ctx.fillText(value, x, y);
  }
  ctx.restore();
};

function _typeof$1(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }
function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$1(self); }
function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
function _defineProperty$4(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var HeatMapCanvas =
function (_Component) {
  _inherits$1(HeatMapCanvas, _Component);
  function HeatMapCanvas() {
    var _getPrototypeOf2;
    var _this;
    _classCallCheck$1(this, HeatMapCanvas);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _possibleConstructorReturn$1(this, (_getPrototypeOf2 = _getPrototypeOf$1(HeatMapCanvas)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _defineProperty$4(_assertThisInitialized$1(_this), "handleMouseHover", function (showTooltip, hideTooltip, event) {
      if (!_this.nodes) return;
      var _getRelativeCursor = getRelativeCursor(_this.surface, event),
          _getRelativeCursor2 = _slicedToArray(_getRelativeCursor, 2),
          x = _getRelativeCursor2[0],
          y = _getRelativeCursor2[1];
      var _this$props = _this.props,
          margin = _this$props.margin,
          offsetX = _this$props.offsetX,
          offsetY = _this$props.offsetY,
          theme = _this$props.theme,
          setCurrentNode = _this$props.setCurrentNode,
          tooltip = _this$props.tooltip;
      var node = _this.nodes.find(function (node) {
        return isCursorInRect(node.x + margin.left + offsetX - node.width / 2, node.y + margin.top + offsetY - node.height / 2, node.width, node.height, x, y);
      });
      if (node !== undefined) {
        setCurrentNode(node);
        showTooltip(React.createElement(HeatMapCellTooltip$1, {
          node: node,
          theme: theme,
          tooltip: tooltip
        }), event);
      } else {
        setCurrentNode(null);
        hideTooltip();
      }
    });
    _defineProperty$4(_assertThisInitialized$1(_this), "handleMouseLeave", function (hideTooltip) {
      _this.props.setCurrentNode(null);
      hideTooltip();
    });
    _defineProperty$4(_assertThisInitialized$1(_this), "handleClick", function (event) {
      if (!_this.props.currentNode) return;
      _this.props.onClick(_this.props.currentNode, event);
    });
    return _this;
  }
  _createClass$1(HeatMapCanvas, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.ctx = this.surface.getContext('2d');
      this.draw(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(props) {
      if (this.props.outerWidth !== props.outerWidth || this.props.outerHeight !== props.outerHeight || this.props.isInteractive !== props.isInteractive || this.props.theme !== props.theme) {
        return true;
      } else {
        this.draw(props);
        return false;
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.ctx = this.surface.getContext('2d');
      this.draw(this.props);
    }
  }, {
    key: "draw",
    value: function draw(props) {
      var width = props.width,
          height = props.height,
          outerWidth = props.outerWidth,
          outerHeight = props.outerHeight,
          pixelRatio = props.pixelRatio,
          margin = props.margin,
          offsetX = props.offsetX,
          offsetY = props.offsetY,
          xScale = props.xScale,
          yScale = props.yScale,
          axisTop = props.axisTop,
          axisRight = props.axisRight,
          axisBottom = props.axisBottom,
          axisLeft = props.axisLeft,
          cellShape = props.cellShape,
          enableLabels = props.enableLabels,
          theme = props.theme;
      this.surface.width = outerWidth * pixelRatio;
      this.surface.height = outerHeight * pixelRatio;
      this.ctx.scale(pixelRatio, pixelRatio);
      var renderNode;
      if (cellShape === 'rect') {
        renderNode = partial(renderRect, this.ctx, {
          enableLabels: enableLabels,
          theme: theme
        });
      } else {
        renderNode = partial(renderCircle, this.ctx, {
          enableLabels: enableLabels,
          theme: theme
        });
      }
      var nodes = computeNodes(props);
      this.ctx.fillStyle = theme.background;
      this.ctx.fillRect(0, 0, outerWidth, outerHeight);
      this.ctx.translate(margin.left + offsetX, margin.top + offsetY);
      renderAxesToCanvas(this.ctx, {
        xScale: xScale,
        yScale: yScale,
        width: width - offsetX * 2,
        height: height - offsetY * 2,
        top: axisTop,
        right: axisRight,
        bottom: axisBottom,
        left: axisLeft,
        theme: theme
      });
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      nodes.forEach(renderNode);
      this.nodes = nodes;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;
      var _this$props2 = this.props,
          outerWidth = _this$props2.outerWidth,
          outerHeight = _this$props2.outerHeight,
          pixelRatio = _this$props2.pixelRatio,
          isInteractive = _this$props2.isInteractive,
          theme = _this$props2.theme;
      return React.createElement(Container, {
        isInteractive: isInteractive,
        theme: theme,
        animate: false
      }, function (_ref) {
        var showTooltip = _ref.showTooltip,
            hideTooltip = _ref.hideTooltip;
        return React.createElement("canvas", {
          ref: function ref(surface) {
            _this2.surface = surface;
          },
          width: outerWidth * pixelRatio,
          height: outerHeight * pixelRatio,
          style: {
            width: outerWidth,
            height: outerHeight
          },
          onMouseEnter: partial(_this2.handleMouseHover, showTooltip, hideTooltip),
          onMouseMove: partial(_this2.handleMouseHover, showTooltip, hideTooltip),
          onMouseLeave: partial(_this2.handleMouseLeave, hideTooltip),
          onClick: _this2.handleClick
        });
      });
    }
  }]);
  return HeatMapCanvas;
}(Component);
HeatMapCanvas.propTypes = HeatMapPropTypes;
var HeatMapCanvas$1 = enhance(HeatMapCanvas);

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var ResponsiveHeatMap = function ResponsiveHeatMap(props) {
  return React.createElement(ResponsiveWrapper, null, function (_ref) {
    var width = _ref.width,
        height = _ref.height;
    return React.createElement(HeatMap$1, _extends({
      width: width,
      height: height
    }, props));
  });
};

function _extends$1() { _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
var ResponsiveHeatMapCanvas = function ResponsiveHeatMapCanvas(props) {
  return React.createElement(ResponsiveWrapper, null, function (_ref) {
    var width = _ref.width,
        height = _ref.height;
    return React.createElement(HeatMapCanvas$1, _extends$1({
      width: width,
      height: height
    }, props));
  });
};

export { HeatMap$1 as HeatMap, HeatMapCanvas$1 as HeatMapCanvas, HeatMapDefaultProps, HeatMapPropTypes, ResponsiveHeatMap, ResponsiveHeatMapCanvas };
