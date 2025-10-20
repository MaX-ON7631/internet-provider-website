// News expandable functionality
document.addEventListener('DOMContentLoaded', function() {
  const newsWrappers = document.querySelectorAll('.news-item-wrapper');
  
  newsWrappers.forEach(wrapper => {
    const newsItem = wrapper.querySelector('.news-item');
    const arrow = newsItem.querySelector('.news-item__arrow');
    const expandableContent = wrapper.querySelector('.news-item__expandable');
    
    if (arrow && expandableContent) {
      // Handle arrow click
      arrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        toggleExpandable(wrapper, newsItem, expandableContent);
      });
      
      // Handle news item click (but not on arrow)
      newsItem.addEventListener('click', function(e) {
        const isArrowClick = e.target.closest('.news-item__arrow');
        
        if (!isArrowClick) {
          e.preventDefault();
          e.stopPropagation();
          toggleExpandable(wrapper, newsItem, expandableContent);
        }
      });
      
      // Initialize collapsed state
      expandableContent.style.maxHeight = '0';
      expandableContent.style.opacity = '0';
    }
  });
  
  function toggleExpandable(wrapper, newsItem, expandableContent) {
    const isExpanded = wrapper.classList.contains('news-item--expanded') || 
                      newsItem.classList.contains('news-item--expanded');
    
    if (isExpanded) {
      // Collapse
      wrapper.classList.remove('news-item--expanded');
      newsItem.classList.remove('news-item--expanded');
      expandableContent.style.maxHeight = '0';
      expandableContent.style.opacity = '0';
    } else {
      // Expand
      wrapper.classList.add('news-item--expanded');
      newsItem.classList.add('news-item--expanded');
      expandableContent.style.maxHeight = expandableContent.scrollHeight + 'px';
      expandableContent.style.opacity = '1';
    }
  }
});
