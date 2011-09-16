Ext.ux.JumpableNestedList = Ext.extend(Ext.NestedList, {
    traceSelectionPath: true,
	hideSelectionPath: true,
	jumpToNode: function(nodeInfo,doSelect,hideActive) {
        var me = this,
            tree = me.store.tree,
            nodes = [],
            node = nodeInfo;
        if(Ext.isString(nodeInfo)) {
            // do lookup of node based on id
            node = tree.getNodeById(nodeInfo);
            if(!nodeInfo) {
                return false;
            }
        }
        // first things first; remove existing lists and detail cards from current nested list
        for(i=(me.items.length-1);i >= 1;i--){
            me.remove(me.items.getAt(i));
        }
        // at the top level list (which we'll leave), deselect any selected records
        me.items.getAt(0).deselect(me.items.getAt(0).getSelectedRecords());
        // get the depth of the node
        var depth = node.getDepth();
        var nid = node.id;
        // loop over depth, get node ids of node hierarchy
        for(i=0;i<depth;i++) {
            nodes.push(nid);
            nid =  tree.nodeHash[nid].parentNode.id;
        }
        // reverse the node array, and we'll build out the new lists
        nodes = nodes.reverse();
        var newlist,
			nextlist = me.items.getAt(0),
			prevlist = me.items.getAt(0),
			child,
			tmpnode,
			curridx = 0;
		nextlist = me.items.getAt(0);
        // now loop over hierarchy of nodes, adding lists as we go along
        for(i=0;i<nodes.length;i++) {
            tmpnode = tree.getNodeById(nodes[i]);
            // if it's not a leaf, we're working with a list
            if(!tmpnode.leaf) {
                // get the sublist
                newlist = me.getSubList(tmpnode);
                // add it to the nestedlist
                nextlist = me.addNextCard(newlist.recordNode);
                //me.layout.hideActive = true;
                me.layout.setActiveItem(nextlist,"fade",me.hideSelectionPath);
                if(me.traceSelectionPath) {
                    // get the index of the list we just added
                    curridx = me.items.indexOf(nextlist);
                    // get the one before it
                    prevlist = me.items.getAt(curridx-1);
                    // find the child node that corresponds to the item in the hierarchy
                    child = prevlist.getNode(tmpnode.getRecord())
                    // if doSelect is true, fire select on current node
                    prevlist.selModel.select(child) 
                }
            }
            // is a leaf; will probably want to fire onItemTap()
            else {
                var idx = nextlist.store.find("id",tmpnode.id);
                if(me.traceSelectionPath) {
                    // should be the last added list
                    prevlist = me.items.getAt(curridx);
                    child = prevlist.getNode(tmpnode.getRecord())
                    prevlist.selModel.select(child)
                }
                me.onItemTap(nextlist,idx);
            }
        }
    }
});