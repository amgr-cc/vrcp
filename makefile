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

.PHONY : gen-vrcapi gen-vrcpipe
gen-vrcapi:  # generate the vrcapi types and clients from openapi spec
# config on openapitools.json
	@rm -rf ./src/vrchat/api/* ./src/vrchat/openapi.yaml
	@curl -fsSL https://vrchat.community/openapi.yaml -o ./src/vrchat/openapi.yaml
	@npx @openapitools/openapi-generator-cli generate \
		-i ./src/vrchat/openapi.yaml \
		-g typescript-axios \
		-o ./src/vrchat/api/ \
		--additional-properties="useSingleRequestParameter=true"
	@rm -f ./src/vrchat/openapi.yaml

gen-vrcpipe: # generate the vrcpipe types from websocket spec
	@npx ts-node ./src/vrchat/pipline/gen-type.ts

.PHONY : migrate-generate
migrate-generate:  # generate migration files based on schema changes
	@npx drizzle-kit generate
	@echo "Migration .sql files generated in src/db/migration/drizzle-kit"
	@npx ts-node ./src/db/migration/gen-migration.ts	


.PHONY : prebuild
prebuild: # pre build tasks
	@npx expo prebuild --clean

.PHONY : build-dev build-pre submit
build-dev:  # build the application for development-client
	@eas build --profile development --platform android
build-pre:  # build the application for preview
	@eas build --profile preview --platform android
build-submit:  # submit the application for store
	@eas build --profile production --platform android --submit



.PHONY: lint 
lint: # lint the codebase
# @npx eslint . --fix
	@npx prettier --write "**/*.tsx"
	@echo "tsc checking..." && npx tsc --noEmit && echo "done"
# @npx next lint --fix
