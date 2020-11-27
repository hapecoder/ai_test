import axios from 'axios'
import {
  date
} from 'quasar'
//axios.defaults.baseURL = 'http://192.168.82.205/file/image/open_image';
export async function loadImage(addtion = '', responseType = '') {
  let result = []
  await axios({
    method: 'GET',
    url: "http://192.168.82.205/file/image/" + addtion,
    responseType: responseType
  }).then((res) => {
    //console.log(res.data);
    result = res.data
  })
  return result
}


let uploadUrl = process.env.DEV ? "http://127.0.0.1:10050/api" : ""
export async function upload(func, data = []) {
  let config = []
  switch (func) {
    case "predict":
      config = {
        method: 'POST',
        url: uploadUrl + "/" + func,
        data: {
          "images": data
        }
      }
      break;
    case "images":
      config = {
        method: 'POST',
        url: uploadUrl + "/" + func,
        data: {
          info: {
            path: data[0],
            tags: data[1]
          }
        }
      }
      break;
    case "tags":
      config = {
        method: 'POST',
        url: uploadUrl + "/" + func,
        data: {
          info: {
            prediction: {
              name: "title",
              type: "tag",
              create_time: date.formatDate(Date.now(), 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
              model: {
                name: "aitag",
                version: data[0],
                category: "openvino"
              },
              image_path: data[1]
            },
            result: {
              incorrect: data[2]
            }
          }
        }
      }
      break;
    default:
      config = {}
  }
  let result = []
  await axios(config).then((res) => {
      if (func == 'predict') {
        res.data.map(e => {
          let temp = {}
          let name = e.outputs.map(q => q.tag)
          let score = e.outputs.map(q => q.score)
          name.map((c, index) => {
            if (score[index] > 0.1) {
              temp[c] = score[index]
            }
          })
          result.push(temp)
        })
      }
    })
    .catch(error => {
      console.log('Predict ' + error);
    })

  return result
}



export function request(config) {
  const instance = axios.create({
    timeout: 10000
  })
  return instance(config)
}
