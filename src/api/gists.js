import axios from "./axios";

const filename = "share.json";
const description = "drawDB diagram";

export async function create(content) {
  const res = await axios.post("/gists", {
    public: false,
    filename,
    description,
    content,
  });

  return res.data.data.id;
}

export async function patch(gistId, content) {
  await axios.patch(`/gists/${gistId}`, {
    filename,
    content,
  });
}

export async function del(gistId) {
  await axios.delete(`/gists/${gistId}`);
}

export async function get(gistId) {
  const res = await axios.get(`/gists/${gistId}`);

  return res.data;
}