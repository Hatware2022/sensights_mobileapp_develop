# README #

## Installation Guide for Developement

1.  git clone {bitbucket_repo_url}
2.  git checkout -b 'dev'
3.  git pull origin pb_develop_merge:dev
4.  yarn install

### Run android

1.  cd sensights_mobileapp/
2.  yarn android

### Run ios

1.  cd sensights_mobileapp/ios
2.  pod install && cd ..
3.  yarn ios

#### iOS fix for image load (done automatically during pod install)

Xcode 12 builds seems to have issue, to fix i go to

    node_modules > react-native > Libraries > Images > RCTUIImageViewAnimated.m

And search for if (_currentFrame)

add else block to the if block as seen below code

if (_currentFrame) {
    layer.contentsScale = self.animatedImageScale;
    layer.contents = (__bridge id)_currentFrame.CGImage;
  } else {
    [super displayLayer:layer];
  }
