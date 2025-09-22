# makefile
.DEFAULT_GOAL := help
.PHONY : help
help:   # show this list
	@echo "---- list of available commands ---"
	@grep -E '^[[:alnum:]_/-]+ *:.*?#.*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?# "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
# ----

.PHONY : run
run:  # run the application
	@npx expo start



.PHONY : gen-vrcapi
gen-vrcapi:  # generate the vrcapi types
	@rm -rf ./src/vrchat/api/* ./src/vrchat/openapi.yaml
	@curl -fsSL https://vrchat.community/openapi.yaml -o ./src/vrchat/openapi.yaml
	@npx @openapitools/openapi-generator-cli generate -i ./src/vrchat/openapi.yaml -g typescript-axios -o ./src/vrchat/api/

gen-plugins: # configure the expo modules pligin (build the plugin code)
	@cd modules/native-websocket && EXPO_NONINTERACTIVE=true npx expo-module build plugin
# EXPO_NONINTERACTIVE (disable default watchmode) https://github.com/expo/expo/blob/main/packages/expo-module-scripts/bin/expo-module-build

prebuild: # pre build tasks
	@npx expo prebuild --clean

.PHONY : build-dev build-pre submit
build-dev:  # build the application for development-client
	@eas build --profile development --platform android
build-pre:  # build the application for preview
	@eas build --profile preview --platform android
build-submit:  # submit the application for store
	@eas build --profile production --platform android --submit






.PHONY : m2r r2m
m2r:  # temporary command module to root
	@cp -r modules/native-websocket/android/src/main/* android/app/src/debug
r2m:  # temporary command root to module
	@cp -r android/app/src/debug/* modules/native-websocket/android/src/main