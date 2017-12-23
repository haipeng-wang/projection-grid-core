import { last } from '../utils';

function processRow({ tds = [] }, rowSpans) {
  let start = 0;
  const retRowSpans = rowSpans;
  tds.forEach((td) => {
    while (retRowSpans[start] > 0) {
      retRowSpans[start] -= 1;
      start += 1;
    }

    const newStart = start + (td.props.colspan || 1);
    while (start < newStart) {
      if (retRowSpans[start] > 0) {
        retRowSpans[start] -= 1;
      }

      if (td.props.rowspan > 0) {
        retRowSpans[start] = Math.max(td.props.rowspan - 1, retRowSpans[start] || 0);
      }
      start += 1;
    }
  });

  return {
    colNum: start,
    rowSpans: retRowSpans,
  };
}

function processSection({ trs = [] }) {
  let rowSpans = [];
  const ret = [];

  trs.forEach((tr) => {
    const { colNum, rowSpans: rows } = processRow(tr, rowSpans);
    rowSpans = rows;
    if (last(tr.tds)) {
      ret.push({
        td: last(tr.tds),
        colNum,
      });
    }
  });
  return ret;
}

function updateColspan({
  thead = {
    trs: [],
  },
  tbodies = [],
  tfoot = {
    trs: [],
  },
}) {
  let lastTds = processSection(thead);
  tbodies.forEach((tbody) => {
    lastTds = lastTds.concat(processSection(tbody));
  });
  lastTds = lastTds.concat(processSection(tfoot));

  if (lastTds.length === 0) {
    return;
  }
  const maxTds = lastTds.reduce((a, b) => (a.colNum > b.colNum ? a : b));
  const maxColNum = maxTds.colNum;
  lastTds.forEach((i) => {
    const item = i;
    if (item.td.props.colspan === 0) {
      item.td.props.colspan = maxColNum - (item.colNum - 1);
    }
  });
}

export default function ({
  composeTable,
}) {
  return {
    composeTable(table) {
      const model = composeTable(table);
      // polyfill colspan
      updateColspan(model);
      return model;
    },
  };
}
