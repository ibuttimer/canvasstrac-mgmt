/*jslint node: true */
/*global angular */
'use strict';

angular.module('canvassTrac')

  .service('menuService', menuService);


/* Manually Identify Dependencies
  https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#style-y091
*/

menuService.$inject = ['authFactory', 'MENUS', 'CONFIG', 'USER'];

function menuService(authFactory, MENUS, CONFIG, USER) {

  /*jshint validthis:true */
  this.configMenus = function (scope, loggedIn) {
    var showMenus,
      override,
      doConfigMenu,
      doCampaignMenu;

    if (!loggedIn) {
      showMenus = CONFIG.NOAUTH;  // show menus if authentication disabled
      override = CONFIG.NOAUTH;   // override access check if authentication disabled
    } else {
      showMenus = USER.authenticated;
    }
    // config menu's if need to show, or menu exists and not showing
    doConfigMenu = doCampaignMenu = showMenus;
    if (!showMenus) {
      doConfigMenu = scope.configMenu;
      doCampaignMenu = scope.campaignMenu;
    }
    if (doConfigMenu) {
      scope.configMenu = this.configMenuAccess(MENUS.CONFIG, override);
    }
    if (doCampaignMenu) {
      scope.campaignMenu = this.configMenuAccess(MENUS.CAMPAIGN, override);
    }
  };

  /*jshint validthis:true */
  this.configMenuAccess = function (baseMenu, override) {
    var menu = {
      root: baseMenu.root // copy root
    },
    substate,
    entry,
    count = 0;  // count of menu entries

    Object.getOwnPropertyNames(baseMenu).forEach(function (name) {
      if (name !== 'root') {
        // NOTE: name is the property value from the MENUS config phase & matches the access property in the login response
        menu[name] = {
          header: baseMenu[name].header,
          items: []
        };
        // add items to the menu if user has access
        baseMenu[name].items.forEach(function (item) {
          substate = menu.root.substates.find(function (state) {
            return (state.state === item.sref);
          });
          if (substate) {
            if (override ||
                authFactory.hasAccess(name, substate.access.group, substate.access.privilege)) {

              entry = angular.copy(item);
              entry.name = entry.name.trim(); // remove any whitespace used to set alignment in dropdown menu

              menu[name].items.push(entry);
              ++count;
            }
          }
        });
      }
    });
    if (!count) {
      menu = undefined; // no menu items so no need for menu
    }
    return menu;
  };



}

