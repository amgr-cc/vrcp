
#### run development
- run `make build-dev` to build dev-app apk 
- install dev-app to your device from built apk
- run `make run` to start dev-server

#### try pre-built app
- run `make build-pre` to build pre-app apk
- install pre-app to your device from built apk 

#### submit store and publish
- run `make build-submit` to build prod-app aab and submit to store
- publish from store page  

### update oss-licenses
- run `make gen-oss` to generate assets/licenses.json 

### how apply update of vrchat-api
- run `make gen-vrcapi` to generate vrcapi-client-code
- run `make gen-vrcpipe` to generate vrcapi-pipeline-type-code
