# example invocation
# $ fab -H ubuntu@xx.x.xxx.xx deploy -i ~/.ssh/some.key

from fabric.api import local, run, cd, put

# this can be set by passing venv_path arg to deploy() target
local_venv_path = None

# /var/www/clients.seedscientific.com/uf/UF04
remote_work_path = '~/deploy/polio-work'
remote_backend_path = '/var/www/apps/polio/'
remote_frontend_path = '/var/www/apps/polio/webapp/public/static/'

# deploy build
# build-machine dependencies - node, gulp, bower, sass, compass, ruby, virtualenv, fabric-virtualenv
def deploy(venv_path=None):
    global local_venv_path
    local_venv_path = venv_path;

    # on local machine...
    _build_dependencies()

    # on target machine
    stop_apache()
    _push_to_remote()
    start_apache()

# apache controls
def stop_apache():
    run("sudo /etc/init.d/apache2 stop")

def start_apache():
    run("sudo /etc/init.d/apache2 start")


# build dependencies
def _build_dependencies():
    ### on build machine ###

    # only build with a virtualenv if one is passed in.
    if (local_venv_path):
        # make virtual env
        local('virtualenv %s' % local_venv_path)

        # enter virtual environment
        activate_this_file = "%s/bin/activate_this.py" % local_venv_path
        execfile(activate_this_file, dict(__file__=activate_this_file))

    # update/install dependencies
    local("cd webapp && npm install")

    # build fe and package the project
    # with NODE_ENV=production, uglify have be done.
    local("cd webapp && npm run package")


# push build to remote
def _push_to_remote():
    ### on target machine ###

    # make folder if it doesn't exist #
    run ("mkdir -p %s" % remote_work_path)

    # push to remote server #
    put ('dist/rhizome.zip', remote_work_path)

    # unzip stuff #
    with cd(remote_work_path):

        # Delete all Python, HTML, and SQL files. We don't delete the entire
        # directory because that will catch the media/ directory which will
        # probably have files we want to keep in it. This way we ensure that we
        # clean out old scripts before deploying. Set mindepth to 2 so that we
        # can keep the server's settings.py file in the application folder

        # [these unzips were trying to overwrite .pyc files owned by www-root
        #  so the 'find' command above may not be deleting enough compiled pycs]
        # when the unzip fe files will be included

        run("unzip -o rhizome.zip -d %s" % remote_backend_path)

    # in server path -
    with cd(remote_backend_path):
        # remove compiled files
        run('sudo rm -rf `find . -name "*.pyc"`')

        # install python dependencies
        run("pip install -r requirements.txt")

        # echo "== SYNCDB / MIGRATE =="
        run("python manage.py migrate --settings=settings")

        ## building documentation ##
        # run("cd docs/ && make clean && make html")

        # echo "== RUNNING TESTS =="
        # python manage.py test datapoints.tests.test_cache --settings=polio.settings_test
