import _ from 'underscore';

/*
Configuration added by custom-column projection

  column.col
    column.col.props
    column.col.classes
    column.col.style
    column.col.events
  column.td
    column.td.props
    column.td.classes
    column.td.style
    column.td.events
    column.td.content
  column.th
    column.th.props
    column.td.classes
    column.td.style
    column.th.events
    column.th.content
*/

function decorate(decorator, options, value) {
  if (_.isFunction(decorator)) {
    return decorator(options, value);
  }
  if (_.isObject(decorator)) {
    return _.mapObject(value, (v, key) => decorate(decorator[key], options, v));
  }
  return value;
}

export default function customColumn(config) {
  return _.chain({
    composeCols: 'col',
    composeThs: 'th',
    composeTds: 'td',
  }).mapObject((decoratorKey, composerName) => (options) => {
    const { column: { [decoratorKey]: decorator } } = options;
    return _.map(
      config[composerName](options),
      value => decorate(decorator, options, value)
    );
  }).defaults(config).value();
}