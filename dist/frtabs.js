(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Frtabs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

// Set Array prototype on NodeList (allows for Array methods on NodeLists)
// https://gist.github.com/paulirish/12fb951a8b893a454b32 (#gistcomment-1487315)
;
Object.defineProperty(exports, "__esModule", {
	value: true
});
Object.setPrototypeOf(NodeList.prototype, Array.prototype);

/**
 * @param {string} selector The selector to match for tab components
 * @param {object} options Object containing configuration overrides
 */
var Frtabs = function Frtabs() {
	var selector = arguments.length <= 0 || arguments[0] === undefined ? '.js-fr-tabs' : arguments[0];

	var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var _ref$tablistSelector = _ref.tablistSelector;
	var tablistSelector = _ref$tablistSelector === undefined ? '.fr-tabs__tablist' : _ref$tablistSelector;
	var _ref$activeTabClass = _ref.activeTabClass;
	var activeTabClass = _ref$activeTabClass === undefined ? 'fr-tabs__tab--is-active' : _ref$activeTabClass;
	var _ref$tabpanelSelector = _ref.tabpanelSelector;
	var tabpanelSelector = _ref$tabpanelSelector === undefined ? '.fr-tabs__panel' : _ref$tabpanelSelector;
	var _ref$activePanelClass = _ref.activePanelClass;
	var activePanelClass = _ref$activePanelClass === undefined ? 'fr-tabs__panel--is-active' : _ref$activePanelClass;
	var _ref$tabsReadyClass = _ref.tabsReadyClass;
	var tabsReadyClass = _ref$tabsReadyClass === undefined ? 'has-fr-tabs' : _ref$tabsReadyClass;

	// CONSTANTS
	var doc = document;
	var docEl = doc.documentElement;

	// SUPPORTS
	if (!'querySelector' in doc || !'addEventListener' in window || !docEl.classList) return;

	// SETUP
	// set tab element NodeLists
	var tabContainers = doc.querySelectorAll(selector);
	var tabLists = doc.querySelectorAll(tablistSelector);
	var tabListItems = doc.querySelectorAll(tablistSelector + ' li');
	var tabs = doc.querySelectorAll(tablistSelector + ' a');
	var tabpanels = doc.querySelectorAll(tabpanelSelector);

	// UTILS
	// closest: http://clubmate.fi/jquerys-closest-function-and-pure-javascript-alternatives/
	function _closest(el, fn) {
		return el && (fn(el) ? el : _closest(el.parentNode, fn));
	}

	// A11Y
	function _addA11y() {
		// add role="tablist" to ul
		tabLists.forEach(function (tabList) {
			tabList.setAttribute('role', 'tablist');
		});

		// add role="presentation" to li
		tabListItems.forEach(function (tabItem) {
			tabItem.setAttribute('role', 'presentation');
		});

		// add role="tab" and aria-controls to anchor
		tabs.forEach(function (tab) {
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', tab.hash.substring(1));
		});

		// add role="tabpanel" to section
		tabpanels.forEach(function (tabpanel) {
			tabpanel.setAttribute('role', 'tabpanel');
			// make first child of tabpanel focusable if available
			if (tabpanel.children) {
				tabpanel.children[0].setAttribute('tabindex', 0);
			}
		});
	}

	function _removeA11y() {
		// remove role="tablist" from ul
		tabLists.forEach(function (tabList) {
			tabList.removeAttribute('role');
		});

		// remove role="presentation" from li
		tabListItems.forEach(function (tabItem) {
			tabItem.removeAttribute('role');
		});

		// remove role="tab" and aria-controls from anchor
		tabs.forEach(function (tab) {
			tab.removeAttribute('role');
			tab.removeAttribute('aria-controls');
		});

		// remove role="tabpanel" from section
		tabpanels.forEach(function (tabpanel) {
			tabpanel.removeAttribute('role');
			// remove first child focusability if present
			if (tabpanel.children) {
				tabpanel.children[0].removeAttribute('tabindex');
			}
		});
	}

	// EVENTS
	function _eventTabClick(e) {
		_showTab(e.target);
		e.preventDefault(); // look into remove id/settimeout/reinstate id as an alternative to preventDefault
	}

	function _eventTabKeydown(e) {
		// collect tab targets, and their parents' prev/next (or first/last - this is honkin dom traversing)
		var currentTab = e.target;
		var previousTabItem = currentTab.parentNode.previousElementSibling || currentTab.parentNode.parentNode.lastElementChild;
		var nextTabItem = currentTab.parentNode.nextElementSibling || currentTab.parentNode.parentNode.firstElementChild;

		// catch left/ and right arrow key events
		// if new next/prev tab available, show it by passing tab anchor to _showTab method
		switch (e.keyCode) {
			case 37:
			case 38:
				_showTab(previousTabItem.querySelector('[role="tab"]'));
				e.preventDefault();
				break;
			case 39:
			case 40:
				_showTab(nextTabItem.querySelector('[role="tab"]'));
				e.preventDefault();
				break;
			default:
				break;
		}
	}

	// ACTIONS
	function _showTab(target) {
		var giveFocus = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

		// get context of tab container and its children
		var thisContainer = _closest(target, function (el) {
			return el.classList.contains(selector.substring(1));
		});
		var siblingTabs = thisContainer.querySelectorAll(tablistSelector + ' a');
		var siblingTabpanels = thisContainer.querySelectorAll(tabpanelSelector);

		// set inactives
		siblingTabs.forEach(function (tab) {
			tab.setAttribute('tabindex', -1);
		});
		siblingTabpanels.forEach(function (tabpanel) {
			tabpanel.setAttribute('aria-hidden', 'true');
		});

		// set actives and focus
		target.setAttribute('tabindex', 0);
		if (giveFocus) target.focus();
		doc.getElementById(target.getAttribute('aria-controls')).removeAttribute('aria-hidden');
	}

	// BINDINGS
	function _bindTabsEvents() {
		// bind all tab click and keydown events
		tabs.forEach(function (tab) {
			tab.addEventListener('click', _eventTabClick);
			tab.addEventListener('keydown', _eventTabKeydown);
		});
	}

	function _unbindTabsEvents() {
		// unbind all tab click and keydown events
		tabs.forEach(function (tab) {
			tab.removeEventListener('click', _eventTabClick);
			tab.removeEventListener('keydown', _eventTabKeydown);
		});
	}

	// DESTROY
	function destroy() {
		_removeA11y();
		_unbindTabsEvents();
		docEl.classList.remove(tabsReadyClass);
	}

	// INIT
	function init() {
		if (tabContainers.length) {
			_addA11y();
			_bindTabsEvents();
			// set all first tabs active on init
			tabContainers.forEach(function (tabContainer) {
				_showTab(tabContainer.querySelector(tablistSelector + ' a'), false);
			});
			docEl.classList.add(tabsReadyClass);
		}
	}
	init();

	// REVEAL API
	return {
		init: init,
		destroy: destroy
	};
};

// module exports
exports.default = Frtabs;
module.exports = exports['default'];

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfY29tcG9uZW50cy90YWJzL3RhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUFZLENBQUM7Ozs7QUFJYixNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7Ozs7O0FBQUMsQUFNM0QsSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBTUg7S0FOZ0IsUUFBUSx5REFBRyxhQUFhOztrRUFNNUMsRUFBRTs7aUNBTEwsZUFBZTtLQUFFLGVBQWUsd0NBQUcsbUJBQW1CO2dDQUN0RCxjQUFjO0tBQUUsY0FBYyx1Q0FBRyx5QkFBeUI7a0NBQzFELGdCQUFnQjtLQUFFLGdCQUFnQix5Q0FBRyxpQkFBaUI7a0NBQ3RELGdCQUFnQjtLQUFFLGdCQUFnQix5Q0FBRywyQkFBMkI7Z0NBQ2hFLGNBQWM7S0FBRSxjQUFjLHVDQUFHLGFBQWE7OztBQUsvQyxLQUFNLEdBQUcsR0FBRyxRQUFRLENBQUM7QUFDckIsS0FBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLGVBQWU7OztBQUFDLEFBSWxDLEtBQUksQ0FBQyxlQUFlLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLElBQUksTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPOzs7O0FBQUEsQUFLekYsS0FBSSxhQUFhLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25ELEtBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNyRCxLQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2pFLEtBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFl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QUFDLFlBQVksRUFBSztBQUN2QyxZQUFRLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDO0FBQ0gsUUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDcEM7RUFDRDtBQUNELEtBQUksRUFBRTs7O0FBQUMsQUFJUCxRQUFPO0FBQ04sTUFBSSxFQUFKLElBQUk7QUFDSixTQUFPLEVBQVAsT0FBTztFQUNQLENBQUE7Q0FFRDs7O0FBQUEsa0JBSWMsTUFBTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vIFNldCBBcnJheSBwcm90b3R5cGUgb24gTm9kZUxpc3QgKGFsbG93cyBmb3IgQXJyYXkgbWV0aG9kcyBvbiBOb2RlTGlzdHMpXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvMTJmYjk1MWE4Yjg5M2E0NTRiMzIgKCNnaXN0Y29tbWVudC0xNDg3MzE1KVxuT2JqZWN0LnNldFByb3RvdHlwZU9mKE5vZGVMaXN0LnByb3RvdHlwZSwgQXJyYXkucHJvdG90eXBlKTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIHRvIG1hdGNoIGZvciB0YWIgY29tcG9uZW50c1xuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IGNvbnRhaW5pbmcgY29uZmlndXJhdGlvbiBvdmVycmlkZXNcbiAqL1xuY29uc3QgRnJ0YWJzID0gZnVuY3Rpb24gKHNlbGVjdG9yID0gJy5qcy1mci10YWJzJywge1xuXHRcdHRhYmxpc3RTZWxlY3RvcjogdGFibGlzdFNlbGVjdG9yID0gJy5mci10YWJzX190YWJsaXN0Jyxcblx0XHRhY3RpdmVUYWJDbGFzczogYWN0aXZlVGFiQ2xhc3MgPSAnZnItdGFic19fdGFiLS1pcy1hY3RpdmUnLFxuXHRcdHRhYnBhbmVsU2VsZWN0b3I6IHRhYnBhbmVsU2VsZWN0b3IgPSAnLmZyLXRhYnNfX3BhbmVsJyxcblx0XHRhY3RpdmVQYW5lbENsYXNzOiBhY3RpdmVQYW5lbENsYXNzID0gJ2ZyLXRhYnNfX3BhbmVsLS1pcy1hY3RpdmUnLFxuXHRcdHRhYnNSZWFkeUNsYXNzOiB0YWJzUmVhZHlDbGFzcyA9ICdoYXMtZnItdGFicydcblx0fSA9IHt9KSB7XG5cblxuXHQvLyBDT05TVEFOVFNcblx0Y29uc3QgZG9jID0gZG9jdW1lbnQ7XG5cdGNvbnN0IGRvY0VsID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuXG5cdC8vIFNVUFBPUlRTXG5cdGlmICghJ3F1ZXJ5U2VsZWN0b3InIGluIGRvYyB8fCAhJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyB8fCAhZG9jRWwuY2xhc3NMaXN0KSByZXR1cm47XG5cblxuXHQvLyBTRVRVUFxuXHQvLyBzZXQgdGFiIGVsZW1lbnQgTm9kZUxpc3RzXG5cdGxldCB0YWJDb250YWluZXJzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXHRsZXQgdGFiTGlzdHMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCh0YWJsaXN0U2VsZWN0b3IpO1xuXHRsZXQgdGFiTGlzdEl0ZW1zID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwodGFibGlzdFNlbGVjdG9yICsgJyBsaScpO1xuXHRsZXQgdGFicyA9IGRvYy5xdWVyeVNlbGVjdG9yQWxsKHRhYmxpc3RTZWxlY3RvciArICcgYScpO1xuXHRsZXQgdGFicGFuZWxzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwodGFicGFuZWxTZWxlY3Rvcik7XG5cblxuXHQvLyBVVElMU1xuXHQvLyBjbG9zZXN0OiBodHRwOi8vY2x1Ym1hdGUuZmkvanF1ZXJ5cy1jbG9zZXN0LWZ1bmN0aW9uLWFuZC1wdXJlLWphdmFzY3JpcHQtYWx0ZXJuYXRpdmVzL1xuXHRmdW5jdGlvbiBfY2xvc2VzdCAoZWwsIGZuKSB7XG5cdFx0cmV0dXJuIGVsICYmIChmbihlbCkgPyBlbCA6IF9jbG9zZXN0KGVsLnBhcmVudE5vZGUsIGZuKSk7XG5cdH1cblxuXG5cdC8vIEExMVlcblx0ZnVuY3Rpb24gX2FkZEExMXkgKCkge1xuXHRcdC8vIGFkZCByb2xlPVwidGFibGlzdFwiIHRvIHVsXG5cdFx0dGFiTGlzdHMuZm9yRWFjaCgodGFiTGlzdCkgPT4ge1xuXHRcdFx0dGFiTGlzdC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAndGFibGlzdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gYWRkIHJvbGU9XCJwcmVzZW50YXRpb25cIiB0byBsaVxuXHRcdHRhYkxpc3RJdGVtcy5mb3JFYWNoKCh0YWJJdGVtKSA9PiB7XG5cdFx0XHR0YWJJdGVtLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcmVzZW50YXRpb24nKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyBhZGQgcm9sZT1cInRhYlwiIGFuZCBhcmlhLWNvbnRyb2xzIHRvIGFuY2hvclxuXHRcdHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG5cdFx0XHR0YWIuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3RhYicpO1xuXHRcdFx0dGFiLnNldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycsIHRhYi5oYXNoLnN1YnN0cmluZygxKSk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly8gYWRkIHJvbGU9XCJ0YWJwYW5lbFwiIHRvIHNlY3Rpb25cblx0XHR0YWJwYW5lbHMuZm9yRWFjaCgodGFicGFuZWwpID0+IHtcblx0XHRcdHRhYnBhbmVsLnNldEF0dHJpYnV0ZSgncm9sZScsICd0YWJwYW5lbCcpO1xuXHRcdFx0Ly8gbWFrZSBmaXJzdCBjaGlsZCBvZiB0YWJwYW5lbCBmb2N1c2FibGUgaWYgYXZhaWxhYmxlXG5cdFx0XHRpZiAodGFicGFuZWwuY2hpbGRyZW4pIHtcblx0XHRcdFx0dGFicGFuZWwuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBfcmVtb3ZlQTExeSAoKSB7XG5cdFx0Ly8gcmVtb3ZlIHJvbGU9XCJ0YWJsaXN0XCIgZnJvbSB1bFxuXHRcdHRhYkxpc3RzLmZvckVhY2goKHRhYkxpc3QpID0+IHtcblx0XHRcdHRhYkxpc3QucmVtb3ZlQXR0cmlidXRlKCdyb2xlJyk7XG5cdFx0fSk7XG5cblx0XHQvLyByZW1vdmUgcm9sZT1cInByZXNlbnRhdGlvblwiIGZyb20gbGlcblx0XHR0YWJMaXN0SXRlbXMuZm9yRWFjaCgodGFiSXRlbSkgPT4ge1xuXHRcdFx0dGFiSXRlbS5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyByZW1vdmUgcm9sZT1cInRhYlwiIGFuZCBhcmlhLWNvbnRyb2xzIGZyb20gYW5jaG9yXG5cdFx0dGFicy5mb3JFYWNoKCh0YWIpID0+IHtcblx0XHRcdHRhYi5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHRcdHRhYi5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyByZW1vdmUgcm9sZT1cInRhYnBhbmVsXCIgZnJvbSBzZWN0aW9uXG5cdFx0dGFicGFuZWxzLmZvckVhY2goKHRhYnBhbmVsKSA9PiB7XG5cdFx0XHR0YWJwYW5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcblx0XHRcdC8vIHJlbW92ZSBmaXJzdCBjaGlsZCBmb2N1c2FiaWxpdHkgaWYgcHJlc2VudFxuXHRcdFx0aWYgKHRhYnBhbmVsLmNoaWxkcmVuKSB7XG5cdFx0XHRcdHRhYnBhbmVsLmNoaWxkcmVuWzBdLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cblx0Ly8gRVZFTlRTXG5cdGZ1bmN0aW9uIF9ldmVudFRhYkNsaWNrIChlKSB7XG5cdFx0X3Nob3dUYWIoZS50YXJnZXQpO1xuXHRcdGUucHJldmVudERlZmF1bHQoKTsgLy8gbG9vayBpbnRvIHJlbW92ZSBpZC9zZXR0aW1lb3V0L3JlaW5zdGF0ZSBpZCBhcyBhbiBhbHRlcm5hdGl2ZSB0byBwcmV2ZW50RGVmYXVsdFxuXHR9XG5cblx0ZnVuY3Rpb24gX2V2ZW50VGFiS2V5ZG93biAoZSkge1xuXHRcdC8vIGNvbGxlY3QgdGFiIHRhcmdldHMsIGFuZCB0aGVpciBwYXJlbnRzJyBwcmV2L25leHQgKG9yIGZpcnN0L2xhc3QgLSB0aGlzIGlzIGhvbmtpbiBkb20gdHJhdmVyc2luZylcblx0XHRsZXQgY3VycmVudFRhYiA9IGUudGFyZ2V0O1xuXHRcdGxldCBwcmV2aW91c1RhYkl0ZW0gPSBjdXJyZW50VGFiLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZyB8fCBjdXJyZW50VGFiLnBhcmVudE5vZGUucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkO1xuXHRcdGxldCBuZXh0VGFiSXRlbSA9IGN1cnJlbnRUYWIucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcgfHwgY3VycmVudFRhYi5wYXJlbnROb2RlLnBhcmVudE5vZGUuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cblx0XHQvLyBjYXRjaCBsZWZ0LyBhbmQgcmlnaHQgYXJyb3cga2V5IGV2ZW50c1xuXHRcdC8vIGlmIG5ldyBuZXh0L3ByZXYgdGFiIGF2YWlsYWJsZSwgc2hvdyBpdCBieSBwYXNzaW5nIHRhYiBhbmNob3IgdG8gX3Nob3dUYWIgbWV0aG9kXG5cdFx0c3dpdGNoIChlLmtleUNvZGUpIHtcblx0XHRcdGNhc2UgMzc6XG5cdFx0XHRjYXNlIDM4OlxuXHRcdFx0XHRfc2hvd1RhYihwcmV2aW91c1RhYkl0ZW0ucXVlcnlTZWxlY3RvcignW3JvbGU9XCJ0YWJcIl0nKSk7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM5OlxuXHRcdFx0Y2FzZSA0MDpcblx0XHRcdFx0X3Nob3dUYWIobmV4dFRhYkl0ZW0ucXVlcnlTZWxlY3RvcignW3JvbGU9XCJ0YWJcIl0nKSk7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXG5cdC8vIEFDVElPTlNcblx0ZnVuY3Rpb24gX3Nob3dUYWIgKHRhcmdldCwgZ2l2ZUZvY3VzID0gdHJ1ZSkge1xuXHRcdC8vIGdldCBjb250ZXh0IG9mIHRhYiBjb250YWluZXIgYW5kIGl0cyBjaGlsZHJlblxuXHRcdGxldCB0aGlzQ29udGFpbmVyID0gX2Nsb3Nlc3QodGFyZ2V0LCAoZWwpID0+IHtcblx0XHRcdHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoc2VsZWN0b3Iuc3Vic3RyaW5nKDEpKTtcblx0XHR9KTtcblx0XHRsZXQgc2libGluZ1RhYnMgPSB0aGlzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGFibGlzdFNlbGVjdG9yICsgJyBhJyk7XG5cdFx0bGV0IHNpYmxpbmdUYWJwYW5lbHMgPSB0aGlzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGFicGFuZWxTZWxlY3Rvcik7XG5cblx0XHQvLyBzZXQgaW5hY3RpdmVzXG5cdFx0c2libGluZ1RhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG5cdFx0XHR0YWIuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcblx0XHR9KTtcblx0XHRzaWJsaW5nVGFicGFuZWxzLmZvckVhY2goKHRhYnBhbmVsKSA9PiB7XG5cdFx0XHR0YWJwYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyBzZXQgYWN0aXZlcyBhbmQgZm9jdXNcblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIDApO1xuXHRcdGlmIChnaXZlRm9jdXMpIHRhcmdldC5mb2N1cygpO1xuXHRcdGRvYy5nZXRFbGVtZW50QnlJZCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcblx0fVxuXG5cblx0Ly8gQklORElOR1Ncblx0ZnVuY3Rpb24gX2JpbmRUYWJzRXZlbnRzICgpIHtcblx0XHQvLyBiaW5kIGFsbCB0YWIgY2xpY2sgYW5kIGtleWRvd24gZXZlbnRzXG5cdFx0dGFicy5mb3JFYWNoKCh0YWIpID0+IHtcblx0XHRcdHRhYi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF9ldmVudFRhYkNsaWNrKTtcblx0XHRcdHRhYi5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2V2ZW50VGFiS2V5ZG93bik7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBfdW5iaW5kVGFic0V2ZW50cyAoKSB7XG5cdFx0Ly8gdW5iaW5kIGFsbCB0YWIgY2xpY2sgYW5kIGtleWRvd24gZXZlbnRzXG5cdFx0dGFicy5mb3JFYWNoKCh0YWIpID0+IHtcblx0XHRcdHRhYi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIF9ldmVudFRhYkNsaWNrKTtcblx0XHRcdHRhYi5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2V2ZW50VGFiS2V5ZG93bik7XG5cdFx0fSk7XG5cdH1cblxuXG5cdC8vIERFU1RST1lcblx0ZnVuY3Rpb24gZGVzdHJveSAoKSB7XG5cdFx0X3JlbW92ZUExMXkoKTtcblx0XHRfdW5iaW5kVGFic0V2ZW50cygpO1xuXHRcdGRvY0VsLmNsYXNzTGlzdC5yZW1vdmUodGFic1JlYWR5Q2xhc3MpO1xuXHR9XG5cblxuXHQvLyBJTklUXG5cdGZ1bmN0aW9uIGluaXQgKCkge1xuXHRcdGlmICh0YWJDb250YWluZXJzLmxlbmd0aCkge1xuXHRcdFx0X2FkZEExMXkoKTtcblx0XHRcdF9iaW5kVGFic0V2ZW50cygpO1xuXHRcdFx0Ly8gc2V0IGFsbCBmaXJzdCB0YWJzIGFjdGl2ZSBvbiBpbml0XG5cdFx0XHR0YWJDb250YWluZXJzLmZvckVhY2goKHRhYkNvbnRhaW5lcikgPT4ge1xuXHRcdFx0XHRfc2hvd1RhYih0YWJDb250YWluZXIucXVlcnlTZWxlY3Rvcih0YWJsaXN0U2VsZWN0b3IgKyAnIGEnKSwgZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0XHRkb2NFbC5jbGFzc0xpc3QuYWRkKHRhYnNSZWFkeUNsYXNzKTtcblx0XHR9XG5cdH1cblx0aW5pdCgpO1xuXG5cblx0Ly8gUkVWRUFMIEFQSVxuXHRyZXR1cm4ge1xuXHRcdGluaXQsXG5cdFx0ZGVzdHJveVxuXHR9XG5cbn1cblxuXG4vLyBtb2R1bGUgZXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgRnJ0YWJzO1xuIl19
