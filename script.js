// Study Hub JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load courses data when page loads
    loadCoursesData();

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    menuToggle.addEventListener('click', function() {
        const coursesSection = document.getElementById('coursesSection');
        const courseDetailSection = document.getElementById('courseDetailSection');

        if (courseDetailSection.style.display === 'block') {
            hideCourseDetailSection();
        } else if (coursesSection.style.display !== 'none') {
            hideCoursesSection();
        } else {
            this.classList.toggle('active');
            const spans = this.querySelectorAll('span');
            spans.forEach(span => span.style.transform = this.classList.contains('active') ? 'rotate(45deg)' : 'rotate(0deg)');
        }
    });

    // Explore Courses button
const exploreBtn = document.getElementById("exploreCourses");
if (exploreBtn) {
  exploreBtn.addEventListener("click", () => {
    showCoursesSection();   // ✅ abhi sahi function call karega
  });
}

// Optional: Join Community button
const joinBtn = document.getElementById("joinCommunity");
if (joinBtn) {
  joinBtn.addEventListener("click", () => {
    alert("🚀 Community feature coming soon!");
  });
    
    // Hero icon animation
    const heroIcon = document.querySelector('.icon-circle');
    if (heroIcon) {
        heroIcon.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.05) rotate(5deg)'; });
        heroIcon.addEventListener('mouseleave', function() { this.style.transform = 'scale(1) rotate(0deg)'; });
    }
});

// Fade-in animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);
});

// Global state
let coursesData = [];
let currentCourseDetails = null;
let hlsInstance = null;
let currentVideoIndex = 0;

// Parse counts
function parseContentCounts(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    let videoCount = 0, pdfCount = 0;
    lines.forEach(line => {
        if (line.includes('.mp4') || line.includes('.m3u8') || line.includes('youtube.com') || line.includes('youtu.be')) videoCount++;
        else if (line.includes('.pdf')) pdfCount++;
    });
    return { videos: videoCount, pdfs: pdfCount };
}

async function loadCourseContentCounts(txtFileName) {
    try {
        const response = await fetch(`/course_txts/${txtFileName}`);
        if (response.ok) {
            const content = await response.text();
            return parseContentCounts(content);
        }
        return null;
    } catch {
        return null;
    }
}

async function loadCoursesData() {
    try {
        const response = await fetch('/courses/metadata.json');
        if (response.ok) {
            coursesData = await response.json();
            for (let course of coursesData) {
                if (course.txtFile) {
                    const counts = await loadCourseContentCounts(course.txtFile);
                    course.videos = counts ? counts.videos : 0;
                    course.pdfs = counts ? counts.pdfs : 0;
                } else {
                    course.videos = 0; course.pdfs = 0;
                }
            }
        }
    } catch {
        coursesData = [];
    }
}

// Show/Hide courses
async function showCoursesSection() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.trust').style.display = 'none';
    document.getElementById('coursesSection').style.display = 'block';
    document.getElementById('menuToggle').innerHTML = '<span style="font-size: 24px;">🏠</span>';
    await loadCoursesData();
    populateCourses();
    document.getElementById('searchCourses').addEventListener('input', function() {
        filterCourses(this.value);
    });
    window.scrollTo(0, 0);
}
function hideCoursesSection() {
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.trust').style.display = 'block';
    document.getElementById('coursesSection').style.display = 'none';
    document.getElementById('menuToggle').innerHTML = '<span></span><span></span><span></span>';
    window.scrollTo(0, 0);
}

function populateCourses(courses = coursesData) {
    const list = document.getElementById('coursesList');
    list.innerHTML = '';
    courses.forEach(c => list.appendChild(createCourseCard(c)));
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    const isImageUrl = course.thumbnail.startsWith('http');
    const thumbnailContent = isImageUrl ? `<img src="${course.thumbnail}" alt="${course.title}" style="width:100%;height:100%;object-fit:cover;">` : course.thumbnail;
    card.innerHTML = `
      <div class="course-thumbnail">${thumbnailContent}</div>
      <div class="course-content">
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description}</p>
        <div class="course-stats">
          <div class="stat-item stat-videos">▶ ${course.videos} Videos</div>
          <div class="stat-item stat-pdfs">📄 ${course.pdfs} PDFs</div>
        </div>
        <div class="course-dates">
          <div class="date-item start-date">📅 ${course.startDate}</div>
          <div class="date-item end-date">📅 ${course.endDate}</div>
        </div>
        <button class="course-explore-btn" onclick="exploreCourse(${course.id})">Explore</button>
      </div>`;
    return card;
}

function filterCourses(term) {
    populateCourses(coursesData.filter(c => c.title.toLowerCase().includes(term.toLowerCase()) || c.description.toLowerCase().includes(term.toLowerCase())));
}

// Parse course content
async function parseDetailedCourseContent(txtFile) {
    try {
        const response = await fetch(`/course_txts/${txtFile}`);
        if (!response.ok) return { videos: [], pdfs: [] };
        const lines = (await response.text()).split('\n').filter(l => l.trim() !== '');
        const videos = [], pdfs = []; let section = 'videos';
        for (let line of lines) {
            line = line.trim(); if (!line || line.startsWith('#')) { if (line.toLowerCase().includes('pdf')) section='pdfs'; if (line.toLowerCase().includes('video')) section='videos'; continue; }
            if (line.includes(': ')) {
                const [title, url] = line.split(': ');
                const item = { title: title.trim(), url: url.trim() };
                if (isVideoUrl(url)) videos.push(item); else if (isPdfUrl(url)) pdfs.push(item); else (section==='videos'?videos:pdfs).push(item);
            } else if (isUrl(line)) {
                const url=line; const item={title:extractTitleFromUrl(url),url};
                if (isVideoUrl(url)) videos.push(item); else if (isPdfUrl(url)) pdfs.push(item); else (section==='videos'?videos:pdfs).push(item);
            }
        }
        return { videos, pdfs };
    } catch { return { videos: [], pdfs: [] }; }
}

// Helpers
function isUrl(s) { try { new URL(s); return true; } catch { return false; } }
function isVideoUrl(u) { const ex=['.mp4','.m3u8','.avi','.mov','.wmv']; u=u.toLowerCase(); return ex.some(e=>u.includes(e))||u.includes('youtube.com')||u.includes('youtu.be'); }
function isPdfUrl(u) { return u.toLowerCase().includes('.pdf')||u.toLowerCase().includes('/pdf/'); }
function extractTitleFromUrl(u){try{const p=u.split('/');return p[p.length-1].split('.')[0].replace(/[-_]/g,' ');}catch{return 'Untitled';}}

// Explore course
async function exploreCourse(id) {
    const course = coursesData.find(c => c.id===id);
    if (!course || !course.txtFile) { alert('Course content not available'); return; }
    const details = await parseDetailedCourseContent(course.txtFile);
    currentCourseDetails = { course, ...details };
    showCourseDetailSection();
}

function showCourseDetailSection() {
    if (!currentCourseDetails) return;
    document.querySelector('.hero').style.display='none';
    document.querySelector('.trust').style.display='none';
    document.getElementById('coursesSection').style.display='none';
    document.getElementById('courseDetailSection').style.display='block';
    document.getElementById('menuToggle').innerHTML='<span style="font-size:24px;">🏠</span>';
    populateCourseDetail();
    setupCourseTabs();
    window.scrollTo(0,0);
}
function hideCourseDetailSection() {
    document.querySelector('.hero').style.display='none';
    document.querySelector('.trust').style.display='none';
    document.getElementById('coursesSection').style.display='block';
    document.getElementById('courseDetailSection').style.display='none';
    document.getElementById('menuToggle').innerHTML='<span style="font-size:24px;">🏠</span>';
    window.scrollTo(0,0);
}

function populateCourseDetail() {
    const { course, videos, pdfs } = currentCourseDetails;
    document.getElementById('courseDetailTitle').textContent = course.title;
    document.getElementById('videosCount').textContent = videos.length;
    document.getElementById('pdfsCount').textContent = pdfs.length;

    const vItems = document.getElementById('videosItems'); vItems.innerHTML='';
    videos.forEach((v,i)=>vItems.appendChild(createContentItem(v,i+1,'video')));
    document.querySelector('#videosList .content-section-title').textContent=`All Videos - ${course.title}`;

    const pItems = document.getElementById('pdfsItems'); pItems.innerHTML='';
    pdfs.forEach((p,i)=>pItems.appendChild(createContentItem(p,i+1,'pdf')));
    document.querySelector('#pdfsList .content-section-title').textContent=`All PDFs - ${course.title}`;

    setupPlayerControls();
    if (videos.length) playInPlayer(videos[0].url, videos[0].title, 0);
    else document.getElementById('videoPlayer').style.display='none';
}

function createContentItem(content, number, type) {
    const item=document.createElement('div'); item.className=`content-item ${type}`;
    if (type==='video') item.onclick=()=>playInPlayer(content.url, content.title, number-1);
    else item.onclick=()=>openContent(content.url);
    item.innerHTML=`
      <div class="content-number">${number}</div>
      <div class="content-title">${content.title}</div>
      ${type==='video'&&number===1?'<div class="content-status">Playing</div>':''}`;
    if (type==='video'&&number===1) item.classList.add('playing');
    return item;
}

// Tabs
function setupCourseTabs() {
    const vTab=document.getElementById('videosTab'), pTab=document.getElementById('pdfsTab');
    const vList=document.getElementById('videosList'), pList=document.getElementById('pdfsList');
    vTab.onclick=()=>{vTab.classList.add('active');pTab.classList.remove('active');vList.classList.add('active');pList.classList.remove('active');};
    pTab.onclick=()=>{pTab.classList.add('active');vTab.classList.remove('active');pList.classList.add('active');vList.classList.remove('active');};
}

// Open PDFs
function openContent(url){window.open(url,'_blank');}

// 🔹 Player Functions
let currentCourseDetails = null;
let currentVideoIndex = 0;
let hlsInstance = null;

function ensureHlsDetached() {
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
}

function playInPlayer(url, title, index = 0) {
    const wrap = document.getElementById('videoPlayer'),
          titleEl = document.getElementById('playerTitle'),
          videoEl = document.getElementById('mainPlayer'),
          idx = document.getElementById('indexBadge');

    wrap.style.display = 'block';

    // reset + update title
    titleEl.classList.remove('playing');
    titleEl.textContent = title || 'Playing';
    titleEl.classList.add('playing');

    currentVideoIndex = index;
    const total = (currentCourseDetails?.videos || []).length;
    idx.textContent = `${index + 1} / ${total}`;

    document.querySelectorAll('#videosItems .content-item').forEach(el => {
        el.classList.remove('playing');
        const s = el.querySelector('.content-status');
        if (s) s.textContent = '';
    });

    const cur = document.querySelectorAll('#videosItems .content-item')[index];
    if (cur) {
        cur.classList.add('playing');
        const s = cur.querySelector('.content-status');
        if (s) s.textContent = 'Playing';
    }

    ensureHlsDetached();
    videoEl.pause();
    videoEl.removeAttribute('src');

    const lower = url.toLowerCase();
    if (lower.endsWith('.m3u8') || lower.includes('m3u8')) {
        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(videoEl);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => videoEl.play());
        } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = url;
            videoEl.play();
        } else {
            alert('Your browser cannot play HLS without hls.js');
        }
    } else {
        videoEl.src = url;
        videoEl.play();
    }
}

function setupPlayerControls() {
    const prev = document.getElementById('prevBtn'),
          next = document.getElementById('nextBtn'),
          speed = document.getElementById('speedSelect'),
          videoEl = document.getElementById('mainPlayer'),
          header = document.querySelector('.header');

    prev.onclick = () => {
        const vids = currentCourseDetails?.videos || [];
        if (!vids.length) return;
        currentVideoIndex = (currentVideoIndex - 1 + vids.length) % vids.length;
        const v = vids[currentVideoIndex];
        playInPlayer(v.url, v.title, currentVideoIndex);
    };

    next.onclick = () => {
        const vids = currentCourseDetails?.videos || [];
        if (!vids.length) return;
        currentVideoIndex = (currentVideoIndex + 1) % vids.length;
        const v = vids[currentVideoIndex];
        playInPlayer(v.url, v.title, currentVideoIndex);
    };

    speed.onchange = () => {
        videoEl.playbackRate = parseFloat(speed.value.replace('x', '')) || 1;
    };

    // hide header when playing
    videoEl.addEventListener('play', () => { header.style.display = 'none'; });
    videoEl.addEventListener('pause', () => { header.style.display = 'block'; });
    videoEl.addEventListener('ended', () => { header.style.display = 'block'; });
}

document.addEventListener('DOMContentLoaded', () => {
    setupPlayerControls();
});
