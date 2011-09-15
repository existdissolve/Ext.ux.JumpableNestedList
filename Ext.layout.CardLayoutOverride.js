Ext.override(Ext.layout.CardLayout, {
    setActiveItem: function(newCard, animation,hideActive) {
        var me = this,
            owner = me.owner,
            doc = Ext.getDoc(),
            oldCard = me.activeItem,
            newIndex;
        animation = (animation == undefined) ? this.getAnimation(newCard, owner) : animation;
        var hideActive = hideActive == undefined ? false : hideActive;
        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);
        // If the card is not a child of the owner, then add it
        if (newIndex == -1) {
            owner.add(newCard);
        }
        // Is this a valid, different card?
        if (newCard && oldCard != newCard && owner.onBeforeCardSwitch(newCard, oldCard, newIndex, !!animation) !== false) {
            // If the card has not been rendered yet, now is the time to do so.
            if (!newCard.rendered) {
                this.layout();
            }
            // Fire the beforeactivate and beforedeactivate events on the cards
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }         
            // Make sure the new card is shown, but only show if not explictly prohibited
            if (newCard.hidden && !hideActive) {
                newCard.show();
            }
            me.activeItem = newCard;
            if (animation) {
                doc.on('click', Ext.emptyFn, me, {
                    single: true,
                    preventDefault: true
                });
                Ext.Anim.run(newCard, animation, {
                    out: false,
                    autoClear: true,
                    scope: me,
                    after: function() {
                        Ext.defer(function() {
                            doc.un('click', Ext.emptyFn, me);
                        },
                        50, me);

                        newCard.fireEvent('activate', newCard, oldCard);

                        if (!oldCard) {
                            // If there is no old card, the we have to make sure that we fire
                            // onCardSwitch here.
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    }
                });
                if (oldCard) {
                    Ext.Anim.run(oldCard, animation, {
                        out: true,
                        autoClear: true,
                        after: function() {
                            oldCard.fireEvent('deactivate', oldCard, newCard);
                            if (me.hideInactive && me.activeItem != oldCard) {
                                oldCard.hide();
                            }
                            // We fire onCardSwitch in the after of the oldCard animation
                            // because that is the last one to fire, and we want to make sure
                            // both animations are finished before firing it.
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    });
                }
            }
            else {
                newCard.fireEvent('activate', newCard, oldCard);
                if (oldCard) {
                    oldCard.fireEvent('deactivate', oldCard, newCard);
                    if (me.hideInactive) {
                        oldCard.hide();
                    }
                }
                owner.onCardSwitch(newCard, oldCard, newIndex, false);
            }
            return newCard;
        }
        return false;
    }
})