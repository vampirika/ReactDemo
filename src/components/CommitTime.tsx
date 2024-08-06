import React, { useState, useEffect } from 'react';

function CommitTime() {
  const [commitTime, setCommitTime] = useState('');

  useEffect(() => {
    const fetchCommitTime = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/vampirika/ReactDemo/commits');
        const data = await response.json();
        if (data && data.length > 0) {
          const latestCommit = data[0];
          const commitDate = new Date(latestCommit.commit.committer.date);
          setCommitTime(commitDate.toString());
        }
      } catch (error) {
        console.error('Error fetching commit data:', error);
      }
    };

    fetchCommitTime();
  }, []);

  return (
    <div className='wrapper wrap gap-1'>
      <h4 className='mt-10 mb-10'>Project last updated:</h4>
      <p className='mt-10 mb-10'>{commitTime ? commitTime : 'Loading...'}</p>
    </div>
  );
}

export default CommitTime;