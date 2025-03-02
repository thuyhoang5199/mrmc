import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { memo } from 'react';

const LoadingPage = () => {
  return (
    <div className='loading-page'>
      <Spin
        tip='Loading...'
        indicator={<LoadingOutlined style={{ fontSize: 40 }} />}
      />
    </div>
  );
};

export default memo(LoadingPage);
