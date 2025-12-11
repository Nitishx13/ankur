// Main JS for header interactions (mobile toggle, dropdowns)
(function () {
  // Mobile menu toggle
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function setMobileOpen(open) {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.classList.toggle('open', open);
    mobileNav.setAttribute('aria-hidden', (!open).toString());
    mobileToggle.setAttribute('aria-expanded', open.toString());
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.contains('open');
      setMobileOpen(!isOpen);
    });
  }

  // Mobile submenu toggles
  var mobileSubs = document.querySelectorAll('.mobile-toggle-sub');
  mobileSubs.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var id = btn.getAttribute('data-target');
      var panel = document.getElementById(id);
      if (!panel) return;
      var show = panel.classList.toggle('show');
      panel.setAttribute('aria-hidden', (!show).toString());
    });
  });

  // Desktop dropdown triggers (buttons with .nav-trigger)
  var triggers = document.querySelectorAll('.nav-trigger');
  triggers.forEach(function (btn) {
    var id = btn.getAttribute('aria-controls');
    var menu = document.getElementById(id);

    // mouse enter/leave for desktop
    btn.addEventListener('mouseenter', function () {
      if (window.innerWidth > 900 && menu) {
        menu.classList.add('show');
        menu.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    btn.addEventListener('mouseleave', function () {
      if (window.innerWidth > 900 && menu) {
        // small delay to allow moving into menu
        setTimeout(function () {
          if (!menu.matches(':hover') && !btn.matches(':hover')) {
            menu.classList.remove('show');
            menu.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
          }
        }, 120);
      }
    });

    // keep menu visible while hovering it
    if (menu) {
      menu.addEventListener('mouseleave', function () {
        if (window.innerWidth > 900) {
          menu.classList.remove('show');
          menu.setAttribute('aria-hidden', 'true');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      menu.addEventListener('mouseenter', function () {
        if (window.innerWidth > 900) {
          menu.classList.add('show');
          menu.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Click on trigger toggles dropdown for keyboard/mobile
    btn.addEventListener('click', function (e) {
      var isOpen = menu && menu.classList.contains('show');
      e.preventDefault();
      if (menu) {
        var open = !isOpen;
        if (open) {
          menu.classList.add('show');
          menu.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          menu.classList.remove('show');
          menu.setAttribute('aria-hidden', 'true');
          btn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Click outside to close any open dropdowns/mobile menu
  document.addEventListener('click', function (e) {
    var insideHeader = e.target.closest('.site-header');
    if (!insideHeader) {
      // close mobile
      setMobileOpen(false);
      // close any open dropdowns
      document.querySelectorAll('.dropdown.show').forEach(function (d) {
        d.classList.remove('show');
        d.setAttribute('aria-hidden', 'true');
      });
      document.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.mobile-sub.show').forEach(function (s) {
        s.classList.remove('show');
        s.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Accessibility: close on Escape
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      setMobileOpen(false);
      document.querySelectorAll('.dropdown.show, .mobile-sub.show').forEach(function (el) {
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
      });
      document.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();

// Accessible interactions: nav toggle and simple carousel
document.addEventListener('DOMContentLoaded', function(){
	// Navigation toggle for small screens
	const navToggle = document.querySelector('.hamburger-btn');
	const navList = document.querySelector('#primary-menu');
	const drawer = document.getElementById('nav-drawer');
	const backdrop = document.getElementById('drawer-backdrop');
	const drawerContent = drawer && drawer.querySelector('.drawer-content');

	function bindDropdownToggles(root=document){
		const dropdownToggles = root.querySelectorAll('.has-dropdown > button[aria-controls]');
		dropdownToggles.forEach(btn=>{
			// avoid adding duplicate handlers
			if(btn.dataset.bound) return;
			btn.dataset.bound = '1';
			const parent = btn.closest('.has-dropdown');
			const menuId = btn.getAttribute('aria-controls');
			let menu = menuId ? document.getElementById(menuId) : parent && parent.querySelector('.submenu');
			btn.addEventListener('click', (e)=>{
				e.preventDefault();
				const isOpen = parent.classList.toggle('open');
				btn.setAttribute('aria-expanded', String(isOpen));
				if(menu){ menu.setAttribute('aria-hidden', String(!isOpen)); }
			});
			btn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); } });
		});
	}

	// initial bind for document
	bindDropdownToggles(document);

	// Close dropdowns when clicking outside
	document.addEventListener('click', (e)=>{
		document.querySelectorAll('.has-dropdown').forEach(parent=>{
			const btn = parent.querySelector('button[aria-controls]');
			if(!btn) return;
			if(!parent.contains(e.target)){
				parent.classList.remove('open');
				btn.setAttribute('aria-expanded','false');
				const menu = parent.querySelector('.submenu'); if(menu) menu.setAttribute('aria-hidden','true');
			}
		});
	});

	// Drawer open/close behavior
	function openDrawer(){
		if(!drawer) return;
		drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
		backdrop.classList.add('open'); backdrop.hidden = false; document.body.style.overflow = 'hidden';
		navToggle.setAttribute('aria-expanded','true');
		// populate drawer content once
		if(drawerContent && !drawerContent.querySelector('ul')){
			// clone the primary menu, but add a specific class so drawer CSS can override mobile hide rules
			const clone = navList.cloneNode(true);
			clone.id = 'drawer-primary-menu';
			clone.classList.add('drawer-nav-list');
			// remap submenu ids inside clone to avoid id collisions
			clone.querySelectorAll('[id]').forEach(el=>{ el.id = el.id + '-drawer'; });
			// update dropdown-toggle aria-controls inside clone and remove any data-bound flag
			clone.querySelectorAll('button[aria-controls]').forEach(btn=>{
				const target = btn.getAttribute('aria-controls');
				if(target){ btn.setAttribute('aria-controls', target + '-drawer'); }
				btn.removeAttribute('data-bound');
			});
			// append and bind
			drawerContent.appendChild(clone);
			bindDropdownToggles(drawerContent);
			// ensure visibility by adding a helper class (CSS uses !important for safety)
			clone.classList.add('visible-in-drawer');
		}
		// shift focus into drawer
		setTimeout(()=>{
			const first = drawer.querySelector('a, button');
			first && first.focus();
		}, 120);
	}

	function closeDrawer(){
		if(!drawer) return;
		drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
		backdrop.classList.remove('open'); backdrop.hidden = true; document.body.style.overflow = '';
		navToggle.setAttribute('aria-expanded','false');
		navToggle.focus();
	}

	if(navToggle){
		navToggle.addEventListener('click', (e)=>{
			const isOpen = drawer && drawer.classList.contains('open');
			if(isOpen) closeDrawer(); else openDrawer();
		});
	}

	// Also allow desktop hamburger to toggle inline nav-links for larger small screens (if present)
	const navLinks = document.querySelector('.nav-links');
	if(navLinks && navToggle){
		// Prevent double action when drawer is used on very small screens. Only toggle inline navLinks when drawer is not visible (viewport >=768px)
		navToggle.addEventListener('click', ()=>{
			if(window.innerWidth > 768){
				navLinks.classList.toggle('open');
				const expanded = navToggle.getAttribute('aria-expanded') === 'true';
				navToggle.setAttribute('aria-expanded', String(!expanded));
			}
		});
	}

	// backdrop & drawer close
	if(backdrop) backdrop.addEventListener('click', closeDrawer);
	const drawerClose = document.querySelector('.drawer-close');
	if(drawerClose) drawerClose.addEventListener('click', closeDrawer);

	// close on Esc
	document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeDrawer(); } });

	// Simple accessible carousel implementation using scrollIntoView
	const carousels = document.querySelectorAll('[data-carousel]');
	carousels.forEach(initCarousel);

	function initCarousel(root){
		const track = root.querySelector('.carousel-track');
		const items = Array.from(track.children);
		const prevBtn = root.querySelector('.carousel-btn.prev');
		const nextBtn = root.querySelector('.carousel-btn.next');
		if(!track || items.length===0) return;

		// make items focusable
		items.forEach(item=>{ item.setAttribute('tabindex', '0'); });

		let index = 0;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function scrollToIndex(i){
			index = Math.max(0, Math.min(i, items.length-1));
			const el = items[index];
			if(reduced){
				track.scrollLeft = el.offsetLeft;
			} else {
				el.scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'});
			}
			updateButtons();
		}

		function updateButtons(){
			if(prevBtn) prevBtn.disabled = index<=0;
			if(nextBtn) nextBtn.disabled = index>=items.length-1;
		}

		if(prevBtn){
			prevBtn.addEventListener('click', ()=> scrollToIndex(index-1));
		}
		if(nextBtn){
			nextBtn.addEventListener('click', ()=> scrollToIndex(index+1));
		}

		// Keyboard support when focus inside track
		track.addEventListener('keydown', (e)=>{
			if(e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(index+1); }
			if(e.key === 'ArrowLeft') { e.preventDefault(); scrollToIndex(index-1); }
			if(e.key === 'Home') { e.preventDefault(); scrollToIndex(0); }
			if(e.key === 'End') { e.preventDefault(); scrollToIndex(items.length-1); }
		});

		// Touch support: basic swipe
		let startX = 0;
		track.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; });
		track.addEventListener('touchend', (e)=>{
			const dx = (e.changedTouches[0].clientX - startX);
			if(Math.abs(dx) > 40){
				if(dx < 0) scrollToIndex(index+1); else scrollToIndex(index-1);
			}
		});

		// ensure buttons initial state
		updateButtons();
	}
});
