import '../imports/startup/collections.js';

//Just define the route for the scheme API to serve data to crosser.
import '../imports/api/server/scheme_api.js';

//Setup the QUEUE and create the process_scheme meteor method.
import '../imports/schemes/server/scheme.js';

//Setup the admin publications. (relies on the qwueue in scheme.js)
import '../imports/admin/server/admin.js';

//Setup the app
import '../imports/startup/server/index.js';
