import {Slider} from '@miblanchard/react-native-slider';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const {height, width} = Dimensions.get('window');
const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upvoted, setUpvoted] = useState(false);

  const videoRef = useRef();

  const _flatlistRef = useRef();
  const visibilityConfig = {viewAreaCoveragePercentThreshold: 95};
  const _onViewableItemsChangedRef = useRef(({changed, viewableItems}) => {
    if (changed[0].isViewable) {
      setCurrentIndex(changed[0].index);
      setCurrentItem(viewableItems[0].item);
      setUpvoted(viewableItems[0].item.upvoted);
     
    }
  });

  const fetchVideoFeeds = () => {
    setLoading(true);
    fetch('https://api.socialverseapp.com/feed?page=1')
      .then(response => response.json())
      .then(data => {
        setFeeds(data.posts);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchVideoFeeds();
  }, []);

  const handleLoadStart = data => {
    setLoading(true);
  };
  const handleLoad = data => {
    setDuration(data.duration);
    setLoading(false);
  };
  const handleProgress = data => {
    setCurrentTime(data.currentTime);
  };

  const handleUpvote = () => {
    setUpvoted(!upvoted);
  };
  const handleVideoPress = () => {
    setPaused(!paused);
  };

  const renderItem = ({item, index}) => {
    return (
      <View>
        <Video
          ref={videoRef}
          source={{uri: item.video_link}}
          resizeMode="stretch"
          poster={item.thumbnail_url}
          posterResizeMode="stretch"
          paused={currentIndex === index ? paused : true}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onProgress={handleProgress}
          repeat={true}
          bitrate={100}
          playInBackground={false}
          playWhenInactive={false}
          onError={error => console.log(error)}
          style={[styles.container_renderItem]}
        />
        <TouchableOpacity
          onPress={handleVideoPress}
          style={styles.container_icon_play}>
          {paused && <Icon name="caret-forward" color="white" size={50} />}
          {loading && !paused && <ActivityIndicator size="large" />}
        </TouchableOpacity>

        {/* Video creater and title */}
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            padding: 10,
          }}>
          <View style={styles.container_details}>
            <Text style={{color: '#fff', fontSize: 18}}>@{item.username}</Text>
            {/* Button - Subscribe */}
            <TouchableOpacity style={styles.button_subscribe}>
              <Text style={{color: '#fff'}}>subscribe</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text numberOfLines={2} style={{color: '#fff'}}>
              {item.title}
            </Text>
          </View>
        </View>

        {/* progressbar */}
        <View style={styles.container_video_progress}>
          <Slider
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            minimumTrackTintColor="#8338ec"
            maximumTrackTintColor="#edf2f4"
            disabled={true}
            trackClickable={false}
            trackStyle={{height: 5, width: width}}
            thumbStyle={{display: 'none'}}
            renderThumbComponent={() => <></>}
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={styles.container}>
      <FlatList
        ref={_flatlistRef}
        data={feeds}
        keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        onViewableItemsChanged={_onViewableItemsChangedRef.current}
        pagingEnabled={true}
        viewabilityConfig={visibilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        contentContainerStyle={styles.container_flatlist_contentContainer}
        style={styles.container_flatlist}
      />

      <View style={styles.container_inputbox}>
        <TextInput
          placeholder="Add comment..."
          placeholderTextColor="#fff"
          style={styles.inputbox}
        />
        <TouchableOpacity style={styles.button_send}>
          <Icon name="send-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Videos stats - Like share comments */}
      <View style={styles.container_video_stats}>
        <TouchableOpacity
          onPress={handleUpvote}
          style={styles.icon_video_stats}>
          <Icon
            name={upvoted ? 'heart' : 'heart-outline'}
            size={25}
            color={upvoted ? 'crimson' : '#fff'}
          />
        </TouchableOpacity>
        <Text style={{color: '#fff'}}>{currentItem.upvote_count}</Text>
        <TouchableOpacity style={styles.icon_video_stats}>
          <Icon name="chatbox-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={{color: '#fff'}}>{currentItem.comment_count}</Text>
        <TouchableOpacity style={styles.icon_video_stats}>
          <Icon name="share-social-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={{color: '#fff'}}>{currentItem.share_count}</Text>
        <TouchableOpacity style={styles.icon_video_stats}>
          <Icon name="scan-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={{color: '#fff'}}>View</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button_subscribe: {
    paddingHorizontal: 5,
    marginHorizontal: 5,
    borderWidth: 0.5,
    borderColor: '#fff',
    borderRadius: 5,
  },
  button_send: {
    height: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  container_flatlist: {
    position: 'absolute',
    height: height - 45,
    width: '100%',
  },
  container_flatlist_contentContainer: {},
  container_renderItem: {
    width: '100%',
    height: height - 50,
  },
  container_icon_play: {
    position: 'absolute',
    width: width,
    height: height - 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container_details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container_video_progress: {
    height: 5,
    width: width,
    justifyContent: 'center',
  },
  container_video_stats: {
    borderRadius: 10,
    position: 'absolute',
    alignItems: 'center',
    padding: 10,
    right: 0,
    bottom: 100,
  },
  icon_video_stats: {
    height: 40,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container_inputbox: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 0,
    height: 45,
    width: '100%',
    backgroundColor: 'black',
  },
  inputbox: {
    flex: 1,
    paddingHorizontal: 10,
  },
});

export default Feed;
