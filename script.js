const API_KEY = 'AIzaSyDbTSpRLtAD9zHYUXeW_sJ3nG8So8S5qlo';

document.getElementById('searchButton').addEventListener('click', searchVideos);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchVideos();
    }
});

async function searchVideos() {
    const searchQuery = document.getElementById('searchInput').value;
    if (!searchQuery) return;

    try {
        // 한국 지역 검색 결과 (30개)
        const koreanResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=30&order=viewCount&regionCode=KR&relevanceLanguage=ko&key=${API_KEY}`);
        const koreanData = await koreanResponse.json();

        if (koreanData.items) {
            // 한국 비디오 통계 가져오기
            const koreanVideoIds = koreanData.items.map(item => item.id.videoId).join(',');
            const koreanStatsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${koreanVideoIds}&key=${API_KEY}`);
            const koreanStatsData = await koreanStatsResponse.json();

            displayResults(koreanData.items, koreanStatsData.items);
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        alert('영상을 불러오는 중 오류가 발생했습니다.');
    }
}

function displayResults(videos, stats) {
    const resultsContainer = document.getElementById('videoResults');
    resultsContainer.innerHTML = `
        <h2 class="section-title">한국 인기 영상 TOP 30</h2>
        <div class="video-grid korean-videos"></div>
    `;

    const videoContainer = resultsContainer.querySelector('.korean-videos');

    // 한국 비디오 표시
    videos.forEach((video, index) => {
        const videoStats = stats[index].statistics;
        const viewCount = parseInt(videoStats.viewCount).toLocaleString();
        
        const videoCard = createVideoCard(video, viewCount, index + 1);
        videoContainer.appendChild(videoCard);
    });
}

function createVideoCard(video, viewCount, rank) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.innerHTML = `
        <div class="rank-badge">${rank}</div>
        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}" class="thumbnail">
        <div class="video-info">
            <h3 class="video-title">${video.snippet.title}</h3>
            <p class="channel-title">${video.snippet.channelTitle}</p>
            <p class="video-stats">조회수: ${viewCount}회</p>
        </div>
    `;

    videoCard.addEventListener('click', () => {
        window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank');
    });

    return videoCard;
}
