import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.httpclient.auth.AuthScope;
import com.hivext.api.core.utils.JSONUtils;
import java.io.InputStreamReader;
import java.io.BufferedReader;

var user = "jpublictoken", token = "9d936c8a1188ab2ec645" + "43175a139b3fec018d66", client = new HttpClient();  
var creds = new UsernamePasswordCredentials(user, token);
client.getParams().setAuthenticationPreemptive(true);
client.getState().setCredentials(AuthScope.ANY, creds);

var url = "https://api.github.com/repos/OpenLiberty/open-liberty-operator/branches/master";  
url = eval("(" + exec(new GetMethod(url)).response + ")").commit.commit.tree.url;
url = getUrl(eval("(" + exec(new GetMethod(url)).response + ")").tree, "deploy");  
url = getUrl(eval("(" + exec(new GetMethod(url)).response + ")").tree, "releases");  
var tree = eval("(" + exec(new GetMethod(url)).response + ")").tree;  
var versions = {}, def = "";
for (var i = 0; i < tree.length; i++) {
  if (def < tree[i].path && tree[i].path != "daily") def = tree[i].path;
  versions[tree[i].path] = tree[i].path;
}  
jps.settings.fields[0].values = versions;
jps.settings.fields[0]["default"] = def;

// collaboration requirements
if (parseInt('${fn.compareEngine(7.0)}', 10) >= 0) {
  jps.settings.fields.push({
    "type": "owner",
    "name": "ownerUid",
    "caption": "Owner"
  });
  jps.settings.fields[5].dependsOn = "ownerUid";
}

return jps;

function getUrl(arr, path){
  for (var i = 0; i < arr.length; i ++) if (arr[i].path == path) return arr[i].url;
}  

function exec(method, params) {
    if (params) {
        var requestEntity = new StringRequestEntity(JSONUtils.jsonStringify(params), "application/json", "UTF-8");
        method.setRequestEntity(requestEntity);
    }
    var status = client.executeMethod(method), response = "", result = 0, type = null, error = null;
    if (status == 200 || status == 201) {
        var br = new BufferedReader(new InputStreamReader(method.getResponseBodyAsStream())), line;
        while ((line = br.readLine()) != null) {
            response = response + line;
        }
    } else {
        error = "ERROR: " + method.getStatusLine() + " -> user:" + user + " token:" + token;
        if (status == 401) error = "Wrong username or/and token. Please, double check your entries.";
        result = status, type = "error", response = null;
    }
    method.releaseConnection();
    return {
        result: result,
        response: response,
        type: type,
        message: error
    }
}
