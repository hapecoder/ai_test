import axios from 'axios'
import {
  date
} from 'quasar'
import {
  Notify
} from 'quasar'
let url = "http://192.168.82.205"
export let imgUrl = url + "/file/image/"
export let tagUrl = url + "/model/v1/models/aitag"
export async function loadImage(addtion = '', responseType = '') {
  let result = []
  await axios({
    method: 'GET',
    url: imgUrl + addtion,
    responseType: responseType
  }).then((res) => {
    //console.log(res.data);
    result = res.data
  })
  return result
}


export let uploadUrl = process.env.DEV ? "http://192.168.82.161:10050/api" : "/api"
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
    case "query":
      config = {
        method: 'GET',
        url: uploadUrl + "/images?query=" + data,
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

        res.data.forEach((t, index) => {
          const filterTag = t.outputs
          filterTag.sort((a, b) => {
            return b.score - a.score
          })
          filterTag.map(e => {
            e.children.sort((a, b) => {
              return b.score - a.score
            })
            e.children = e.children.filter((c, i) => {
              if (c.tag == 'qr_code') e.children[i].tag = 'QR code'
              return c.score > 0.5
            })

          })
          res.data[index] = filterTag
        })
        result = res.data

        //upload results
        const query = window.btoa(
          JSON.stringify({
            find: {
              "info.path": data
            }
          })
        );
        axios({
          method: 'GET',
          url: uploadUrl + "/images?query=" + query,
        }).then(qres => {
          let q_method = qres.data.total == 0 ? 'POST' : 'PUT'
          let q_id = qres.data.total == 0 ? '' : qres.data.data[0].id
          axios({
            method: q_method,
            url: uploadUrl + "/images/" + q_id,
            data: {
              info: {
                path: data,
                res: result
              }
            }
          })
        })


      } else result = res
    })
    .catch(error => {
      Notify.create('It seems that network has some errors ')
      console.log('Predict ' + error);
    })

  return result
}
