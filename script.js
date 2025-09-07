// Study Hub JavaScript

// Global state
let coursesData = [];
let currentCourseDetails = null;
let hlsInstance = null;
let currentVideoIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
    // Load courses data on page load
    loadCoursesData();

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    menuToggle.addEventListener('click', function () {
        const coursesSection = document.getElementById('coursesSection');
        const courseDetailSection = document.getElementById('courseDetailSection');

        if (courseDetailSection.style.display === 'block') {
            hideCourseDetailSection();
        } else if (coursesSection.style.display !== 'none') {
            hideCoursesSection();
        } else {
            this.classList.toggle('active');
        }
    });

    // ✅ Explore Courses button
    const exploreBtn = document.getElementById("exploreCourses");
    exploreBtn.addEventListener("click", () => {
        showCoursesSection();
        document.getElementById("courseDetailSection").style.display = "none";
    });

    // Optional: Join Community button
    const joinBtn = document.getElementById("joinCommunity");
    if (joinBtn) {
        joinBtn.addEventListener("click", () => {
            alert("Community feature coming soon! 🚀");
        });
    }

    // Setup player controls
    setupPlayerControls();
});

// -------- Course Data --------
async function loadCoursesData() {
    try {
        const response = await fetch('/courses/metadata.json');
        if (response.ok) {
            coursesData = await response.json();
        }
    } catch {
        coursesData = [];
    }
}

// -------- Show/Hide Sections --------
async function showCoursesSection() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.trust').style.display = 'none';
    document.getElementById('coursesSection').style.display = 'block';
    document.getElementById('menuToggle').innerHTML = '<span style="font-size: 24px;">🏠</span>';
    await loadCoursesData();
    populateCourses();
    document.getElementById('searchCourses').addEventListener('input', function () {
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

// -------- Populate Courses --------
function populateCourses(courses = coursesData) {
    const list = document.getElementById('coursesList');
    list.innerHTML = '';
    courses.forEach(c => list.appendChild(createCourseCard(c)));
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    const isImageUrl = course.thumbnail?.startsWith('http');
    const thumbnailContent = isImageUrl
        ? `<img src="${course.thumbnail}" alt="${course.title}" style="width:100%;height:100%;object-fit:cover;">`
        : course.thumbnail || '';
    card.innerHTML = `
      <div class="course-thumbnail">${thumbnailContent}</div>
      <div class="course-content">
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description || ''}</p>
        <div class="course-stats">
          <div class="stat-item stat-videos">▶ ${course.videos || 0} Videos</div>
          <div class="stat-item stat-pdfs">📄 ${course.pdfs || 0} PDFs</div>
        </div>
        <button class="course-explore-btn" onclick="exploreCourse(${course.id})">Explore</button>
      </div>`;
    return card;
}

function filterCourses(term) {
    populateCourses(coursesData.filter(c =>
        c.title.toLowerCase().includes(term.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(term.toLowerCase())
    ));
}

// -------- Explore Course --------
async function exploreCourse(id) {
    const course = coursesData.find(c => c.id === id);
    if (!course) {
        alert('Course not found');
        return;
    }
    currentCourseDetails = {
        course,
        videos: course.videosList || [],
        pdfs: course.pdfsList || []
    };
    showCourseDetailSection();
}

function showCourseDetailSection() {
    if (!currentCourseDetails) return;
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.trust').style.display = 'none';
    document.getElementById('coursesSection').style.display = 'none';
    document.getElementById('courseDetailSection').style.display = 'block';
    document.getElementById('menuToggle').innerHTML = '<span style="font-size:24px;">🏠</span>';
    populateCourseDetail();
    setupCourseTabs();
    window.scrollTo(0, 0);
}

function hideCourseDetailSection() {
    document.getElementById('coursesSection').style.display = 'block';
    document.getElementById('courseDetailSection').style.display = 'none';
    document.getElementById('menuToggle').innerHTML = '<span style="font-size:24px;">🏠</span>';
    window.scrollTo(0, 0);
}

// -------- Populate Course Details --------
function populateCourseDetail() {
    const { course, videos, pdfs } = currentCourseDetails;
    document.getElementById('courseDetailTitle').textContent = course.title;
    document.getElementById('videosCount').textContent = videos.length;
    document.getElementById('pdfsCount').textContent = pdfs.length;

    const vItems = document.getElementById('videosItems');
    vItems.innerHTML = '';
    videos.forEach((v, i) => vItems.appendChild(createContentItem(v, i + 1, 'video')));

    const pItems = document.getElementById('pdfsItems');
    pItems.innerHTML = '';
    pdfs.forEach((p, i) => pItems.appendChild(createContentItem(p, i + 1, 'pdf')));

    setupPlayerControls();
    if (videos.length) playInPlayer(videos[0].url, videos[0].title, 0);
    else document.getElementById('videoPlayer').style.display = 'none';
}

function createContentItem(content, number, type) {
    const item = document.createElement('div');
    item.className = `content-item ${type}`;
    if (type === 'video') item.onclick = () => playInPlayer(content.url, content.title, number - 1);
    else item.onclick = () => openContent(content.url);
    item.innerHTML = `
      <div class="content-number">${number}</div>
      <div class="content-title">${content.title}</div>`;
    return item;
}

// -------- Tabs --------
function setupCourseTabs() {
    const vTab = document.getElementById('videosTab'),
        pTab = document.getElementById('pdfsTab');
    const vList = document.getElementById('videosList'),
        pList = document.getElementById('pdfsList');
    vTab.onclick = () => {
        vTab.classList.add('active');
        pTab.classList.remove('active');
        vList.classList.add('active');
        pList.classList.remove('active');
    };
    pTab.onclick = () => {
        pTab.classList.add('active');
        vTab.classList.remove('active');
        pList.classList.add('active');
        vList.classList.remove('active');
    };
}

// -------- Open PDFs --------
function openContent(url) { window.open(url, '_blank'); }

// -------- Player --------
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

    // Overlay title (YT style: auto hide)
    titleEl.textContent = title || 'Playing';
    titleEl.style.display = 'block';
    setTimeout(() => { titleEl.style.display = 'none'; }, 4000);

    currentVideoIndex = index;
    const total = (currentCourseDetails?.videos || []).length;
    idx.textContent = `${index + 1} / ${total}`;

    // Clear old playing status
    document.querySelectorAll('#videosItems .content-item').forEach(el => {
        el.classList.remove('playing');
        const s = el.querySelector('.content-status');
        if (s) s.remove();
    });

    // Add Playing to current
    const cur = document.querySelectorAll('#videosItems .content-item')[index];
    if (cur) {
        cur.classList.add('playing');
        const s = document.createElement('div');
        s.className = 'content-status';
        s.textContent = 'Playing';
        cur.appendChild(s);
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

    if (!prev || !next || !speed) return;

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

    // Header auto-hide when playing
    videoEl.addEventListener('play', () => { header.style.display = 'none'; });
    videoEl.addEventListener('pause', () => { header.style.display = 'block'; });
    videoEl.addEventListener('ended', () => { header.style.display = 'block'; });
}
