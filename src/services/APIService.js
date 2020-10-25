import axios from "axios";

const apiClient = axios.create();

export default {
  getPrefix(prefix) {
    return apiClient.get("/api/v1/prefix/" + prefix);
  },
  getASN(asn) {
    return apiClient.get("/api/v1/asn/" + asn);
  },
  getFilename(filename) {
    return apiClient.get("/api/v1/filename/" + filename);
  },
  getObject(path) {
    return apiClient.get("/api/v1/object/" + encodeURIComponent(path));
  },
  getPublicationPoints() {
    return apiClient.get("/api/v1/pp");
  }
};
