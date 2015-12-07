import React from 'react'

import api from '../data/api'

import d3TagsTree from './utils/d3TagsTree'

var TagsTreeAdmin = React.createClass({
  componentDidMount: function() {
    var el = this.getDOMNode();

    api.tagTree({}, null, {'cache-control': 'no-cache'})
      .then(function(a) {
        var data = { data: a.flat[0] };

        // request an animation frame. this makes sure the DOM node is rendered
        window.requestAnimationFrame(function() {
          d3TagsTree.create(el, { width: '100%', height: '500px' }, data);
        });
      });
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3TagsTree.destroy(el);
  },

  render: function() {
    return (<div className="d3-tags-tree"></div>);
  }
})

export default TagsTreeAdmin