from . import extension




@extension.route('/extension')
def extension_route():
    return 'Hello from extension!'