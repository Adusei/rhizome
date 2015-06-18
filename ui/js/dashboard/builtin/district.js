module.exports = {
	'id'     : 2,
	'title'  : 'District Dashboard',
  'charts' : [{
    'title'      : '',
    'id'         : 'district-heat-map',
    'type'       : 'HeatMapChart',
    'region'     : 'subregions',
    // 'level'      : 'district',
    'timeRange'  : 0,
    'series'     : 'region.name',
    'indicators' : [
      475,166,164,167,165, // Missed Children
      222, // Microplans
      187,189, // Conversions
      // FIXME: Transit points in place and with SM
      178,228,179,184,180,185,230,226,239, // Capacity to Perform
      194,219,173,172, // Supply
      245,236,192,193,191, // Polio+
      174, // Access plan
      442,443,444,445,446,447,448,449,450 // Inaccessibility
    ]
  }]
};
