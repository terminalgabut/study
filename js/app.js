// root/js/app.js

// Core
import { supabase } from './services/supabase.js'
import { getProfile } from './services/profileService.js'
import { initHeader } from './ui/header.js'
import { audioController } from './controllers/audioController.js'

// Views
import { headerView } from '../components/headerView.js'
import { sidebarView } from '../components/sidebarView.js'

console.log("app.js optimized ✅")

/* =========================================
   DEBUG
========================================= */

const DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

window.__DEBUG__ = {
  log: (...args) => DEV && console.log('[DEBUG]', ...args),
  warn: (...args) => DEV && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
}

/* =========================================
   DYNAMIC IMPORT (PERFORMANCE)
========================================= */

const loadSidebar = async () => {
  const mod = await import('./ui/sidebar.js')
  mod.initSidebar()
}

const loadRouter = async () => {
  const mod = await import('./router/hashRouter.js')
  mod.initRouter()
}

/* =========================================
   LAYOUT RENDER
========================================= */

function renderLayout() {
  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `
    <div id="main-layout-wrapper">
      ${headerView}
      <div class="layout">
        ${sidebarView}
      </div>
    </div>
    <main id="content"></main>
  `

  if (!document.getElementById('youtube-player')) {
    const ytDiv = document.createElement('div')
    ytDiv.id = 'youtube-player'
    ytDiv.style.cssText =
      'position:absolute; top:-9999px; left:-9999px; width:1px; height:1px;'
    document.body.appendChild(ytDiv)
  }
}

/* =========================================
   INIT
========================================= */

async function init() {
  console.log("Init optimized ✅")
  window.__DEBUG__.log('App init optimized')

  renderLayout()

  audioController.init()
  await initHeader()

  // Jangan block UI
  greetUserOnLoad()

  // Lazy load berat
  loadSidebar()
  loadRouter()

  bindAuthListener()

  window.addEventListener('hashchange', checkLayout)
  checkLayout()
}

/* =========================================
   AUTH LISTENER
========================================= */

function bindAuthListener() {
  supabase.auth.onAuthStateChange((event) => {
    window.__DEBUG__.log('Auth Event:', event)

    if (event === 'SIGNED_OUT') {
      window.location.hash = '#login'
      const content = document.getElementById('content')
      if (content) content.innerHTML = ''
    }

    checkLayout()
  })
}

/* =========================================
   LAYOUT VISIBILITY
========================================= */

function checkLayout() {
  const hash = window.location.hash
  const layoutWrapper = document.getElementById('main-layout-wrapper')
  const contentArea = document.getElementById('content')

  const isAuthPage =
    hash === '#login' ||
    hash === '#register' ||
    hash === '' ||
    hash === '#'

  if (!layoutWrapper || !contentArea) return

  if (isAuthPage) {
    layoutWrapper.style.display = 'none'
    contentArea.style.cssText = 'margin:0;padding:0;'
  } else {
    layoutWrapper.style.display = 'block'
    contentArea.style.cssText = ''
  }
}

/* =========================================
   GREETING (CACHED PROFILE)
========================================= */

async function greetUserOnLoad() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const profile = await getProfile(user.id)

    const name =
      profile?.full_name ||
      profile?.username ||
      user.email?.split('@')[0] ||
      'User'

    window.islandController?.setStatus('greeting', {
      text: `Wellcome ${name}`,
      icon: 'robot',
      priority: -10
    })

    setTimeout(() => {
      window.islandController?.removeStatus('greeting')
    }, 6000)

  } catch (err) {
    console.warn('Greeting gagal:', err)
  }
}

/* =========================================
   BOOT
========================================= */

document.addEventListener('DOMContentLoaded', init)
