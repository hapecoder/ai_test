# aitest

aitest

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ cd web
$ npm i
$ npm run dev
$ open http://localhost:10050/
```

### Deploy

```bash
$ npm run build
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

### API

```json
// document: tags

{
  "info": {
    "prediction": {
      "name": "title",
      "type": "tag",
      "create_time": "2020-11-20 12:23:44.000 Z",
      "model": {
        "name": "aitag",
        "version": 1,
        "category": "openvino"
      },
      "image_path": "auto_test"
    },
    "result": {
      "incorrect" : [
        {
          "path": "auto_test/xxx/1.jpg",
          "tags": [
            {
              "name": "car",
              "truth": 0.30
            }
          ]
        }
      ]
    }
  }
}

// document: images
{
  "info": {
    "path": "auto_test/xxx/1.jpg",
    "tags": [
      {
        "name": "car",
        "region": "54390743"
      }
    ]
  }
}
```

- GET	/api/images
- GET	/api/images/new
- GET	/api/images/:id
- GET	/api/images/:id/edit
- POST	/api/images
- PUT	/api/images/:id
- DELETE	/api/images/:id


- GET	/api/tags
- GET	/api/tags/new
- GET	/api/tags/:id
- GET	/api/tags/:id/edit
- POST	/api/tags
- PUT	/api/tags/:id
- DELETE	/api/tags/:id

- POST /api/predict[?name=aitag&version=1]
```json
{
  "images": ["http://1.jpg", "http://2.jpg"]
}
```

- POST /api/upload