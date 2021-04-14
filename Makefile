CONTAINER=docker.pkg.github.com/xtreamr/aluna_ftp_uploader/aluna_ftp_uploader
VERSION=`node -p -e "require('./package.json').version"`

version_bump_pro:
	git checkout master
	git rebase origin/master
	yarn version --minor
	git checkout develop
	yarn version --minor --preid DEV --no-git-tag-version
	yarn version --prepatch --preid DEV

version_bump_pre:
	git checkout pre
	git rebase origin/pre
	yarn version --preminor --preid PRE
	git checkout develop
	yarn version --preminor --preid DEV --no-git-tag-version
	yarn version --prepatch --preid DEV

version_dev:
	yarn version --new-version `git describe --tags` --no-git-tag-version

docker_dev:
	docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} -t ${CONTAINER}:${VERSION} -t ${CONTAINER}:dev .

push_dev: version_dev docker_dev
	docker push ${CONTAINER}:${VERSION}
	docker push ${CONTAINER}:dev

publish_dev: push_dev
	git checkout -- package.json

docker_pre:
	docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} -t ${CONTAINER}:${VERSION} -t ${CONTAINER}:pre .

push_pre: docker_pre
	docker push ${CONTAINER}:${VERSION}
	docker push ${CONTAINER}:pre

publish_pre: push_pre
	git checkout -- package.json

docker_pro:
	docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} -t ${CONTAINER}:${VERSION} -t ${CONTAINER}:latest .

push_pro: docker_pro
	docker push ${CONTAINER}:${VERSION}
	docker push ${CONTAINER}:latest

publish_pro: push_pro
	git checkout -- package.json

build:
	@mkdir -p build
  NODE_ENV=production yarn build

clean:
	@rm -rf build
