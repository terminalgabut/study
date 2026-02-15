import { audioController } from './controllers/audioController.js';
import { supabase } from './services/supabase.js'; 
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileModal } from './ui/auth/profileModal.js';

// Views
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { babModalView } from '../components/babModalView.js';
import { durasiModalView } from '../components/durasiModalView.js';
import { ulangModalView } from '../components/ulangModalView.js';
import { akurasiModalView } from '../components/akurasiModalView.js';
