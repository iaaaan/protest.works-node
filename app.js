const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('libp2p-ipfs-nodejs')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const bs58 = require('bs58')
// const toPull = require('stream-to-pull-stream')
const async = require('async')
const Pushable = require('pull-pushable')
const p = Pushable()
// let idListener

// 10322-10539
const port = process.argv[2]

const bootstrapID = {
  "id": "QmW2emyuwP4upV1qvkxTptKDhDQteavj8YUfyPVYUVKR48",
  "privKey": "CAAS4AQwggJcAgEAAoGBAMyroKGt5+topFznvgtg5rrnoY0Vkkyl6Yi5Y/vnd96LT7cq0atfhX0ntLQ/0bIJjPTCRGiz+G0UA267lEo9Ax3pPFKb/49JYWWwfH3oDJsa15t3uLbn2GM4XQ2troQfMcMUXoXXcKNGFjXPJp7ufzH87paRSeAQHeLra/PhQjdrAgMBAAECgYB/GID6hZzEQcn3a21HcZg2LorSqreb41efMMjW8Aku6EHLU8q56epiKtr7J7pXHbkrcMu8XS4Cxm/PPqq6YyLgPhpO4lWBHbzVJpUZnTpDhhP6Cj84xLtXoEWqNqJFDQ9GPLhUABF26WZZdEMAWlgno1UyH/bTXDSvonjlpU8zOQJBAPZyIxCMneyFN/MVBhmW9hdGRpqYtAE63+COgM+VWXN2Rbd4Zbe2Zfq5yJXM82Anl0bd+sYMh681AUkBrwyjJCUCQQDUmuNrsVJgvddALGs63NPRjlLuY/j8y2SV3bHIs592Yaxz6XLVcpkql772u3AUBbqObh/6qcbk62YG+4abnNBPAkBq1ziUaCHe9DI5VBf86BFwLatWQnVnQxrjw2PcmqbZA6Fd1PhkGNNFS13Gc7/fI8rVkk6xpaT9NEGGYRB+rgtxAkB5YD/r0J0uG9OSkIlbXo0TOwS/kpWohNnU8W85HMsyA4s31ZQ4pacp+N4N8G6JD8g03kwlh93D/VwPKnPrzTfjAkEA8P6RbnEtxK40IQHvEb2d4PN6sEnM0Z3//C8XvlpRBeYX0Hk7dqUbn4KuWVF0nx0ZbPyvmuDXBIY/Z28vB/IcnQ==",
  "pubKey": "CAASogEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMyroKGt5+topFznvgtg5rrnoY0Vkkyl6Yi5Y/vnd96LT7cq0atfhX0ntLQ/0bIJjPTCRGiz+G0UA267lEo9Ax3pPFKb/49JYWWwfH3oDJsa15t3uLbn2GM4XQ2troQfMcMUXoXXcKNGFjXPJp7ufzH87paRSeAQHeLra/PhQjdrAgMBAAE="
}

let peerBook = {}
let connectedPeers = {}

// const listenerID = {
//   "id": "QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm",
//   "privKey": "CAASqAkwggSkAgEAAoIBAQDLZZcGcbe4urMBVlcHgN0fpBymY+xcr14ewvamG70QZODJ1h9sljlExZ7byLiqRB3SjGbfpZ1FweznwNxWtWpjHkQjTVXeoM4EEgDSNO/Cg7KNlU0EJvgPJXeEPycAZX9qASbVJ6EECQ40VR/7+SuSqsdL1hrmG1phpIju+D64gLyWpw9WEALfzMpH5I/KvdYDW3N4g6zOD2mZNp5y1gHeXINHWzMF596O72/6cxwyiXV1eJ000k1NVnUyrPjXtqWdVLRk5IU1LFpoQoXZU5X1hKj1a2qt/lZfH5eOrF/ramHcwhrYYw1txf8JHXWO/bbNnyemTHAvutZpTNrsWATfAgMBAAECggEAQj0obPnVyjxLFZFnsFLgMHDCv9Fk5V5bOYtmxfvcm50us6ye+T8HEYWGUa9RrGmYiLweuJD34gLgwyzE1RwptHPj3tdNsr4NubefOtXwixlWqdNIjKSgPlaGULQ8YF2tm/kaC2rnfifwz0w1qVqhPReO5fypL+0ShyANVD3WN0Fo2ugzrniCXHUpR2sHXSg6K+2+qWdveyjNWog34b7CgpV73Ln96BWae6ElU8PR5AWdMnRaA9ucA+/HWWJIWB3Fb4+6uwlxhu2L50Ckq1gwYZCtGw63q5L4CglmXMfIKnQAuEzazq9T4YxEkp+XDnVZAOgnQGUBYpetlgMmkkh9qQKBgQDvsEs0ThzFLgnhtC2Jy//ZOrOvIAKAZZf/mS08AqWH3L0/Rjm8ZYbLsRcoWU78sl8UFFwAQhMRDBP9G+RPojWVahBL/B7emdKKnFR1NfwKjFdDVaoX5uNvZEKSl9UubbC4WZJ65u/cd5jEnj+w3ir9G8n+P1gp/0yBz02nZXFgSwKBgQDZPQr4HBxZL7Kx7D49ormIlB7CCn2i7mT11Cppn5ifUTrp7DbFJ2t9e8UNk6tgvbENgCKXvXWsmflSo9gmMxeEOD40AgAkO8Pn2R4OYhrwd89dECiKM34HrVNBzGoB5+YsAno6zGvOzLKbNwMG++2iuNXqXTk4uV9GcI8OnU5ZPQKBgCZUGrKSiyc85XeiSGXwqUkjifhHNh8yH8xPwlwGUFIZimnD4RevZI7OEtXw8iCWpX2gg9XGuyXOuKORAkF5vvfVriV4e7c9Ad4Igbj8mQFWz92EpV6NHXGCpuKqRPzXrZrNOA9PPqwSs+s9IxI1dMpk1zhBCOguWx2m+NP79NVhAoGBAI6WSoTfrpu7ewbdkVzTWgQTdLzYNe6jmxDf2ZbKclrf7lNr/+cYIK2Ud5qZunsdBwFdgVcnu/02czeS42TvVBgs8mcgiQc/Uy7yi4/VROlhOnJTEMjlU2umkGc3zLzDgYiRd7jwRDLQmMrYKNyEr02HFKFn3w8kXSzW5I8rISnhAoGBANhchHVtJd3VMYvxNcQb909FiwTnT9kl9pkjhwivx+f8/K8pDfYCjYSBYCfPTM5Pskv5dXzOdnNuCj6Y2H/9m2SsObukBwF0z5Qijgu1DsxvADVIKZ4rzrGb4uSEmM6200qjJ/9U98fVM7rvOraakrhcf9gRwuspguJQnSO9cLj6",
//   "pubKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDLZZcGcbe4urMBVlcHgN0fpBymY+xcr14ewvamG70QZODJ1h9sljlExZ7byLiqRB3SjGbfpZ1FweznwNxWtWpjHkQjTVXeoM4EEgDSNO/Cg7KNlU0EJvgPJXeEPycAZX9qASbVJ6EECQ40VR/7+SuSqsdL1hrmG1phpIju+D64gLyWpw9WEALfzMpH5I/KvdYDW3N4g6zOD2mZNp5y1gHeXINHWzMF596O72/6cxwyiXV1eJ000k1NVnUyrPjXtqWdVLRk5IU1LFpoQoXZU5X1hKj1a2qt/lZfH5eOrF/ramHcwhrYYw1txf8JHXWO/bbNnyemTHAvutZpTNrsWATfAgMBAAE="
// }



PeerId.create({ bits: 1024 }, (err, id) => {
  // console.log('aga', JSON.stringify(id.toJSON(), null, 2))

  const peer = new PeerInfo(id)
  peer.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/' + port))
  const node = new Node(peer)

  node.start((err) => {
    if (err) {
      throw err
    }

    console.log('started')

    node.swarm.on('peer-mux-established', (peerInfo) => {
      // console.log('peer-mux-established: ', peerInfo.id.toB58String())
      console.log('peer-mux-established: ', peerInfo.id)
    })

    // node.handle('/chat/1.0.0', (protocol, conn) => {
    //   pull(
    //     p,
    //     conn
    //   )

    //   pull(
    //     conn,
    //     pull.map((data) => {
    //       return data.toString('utf8').replace('\n', '')
    //     }),
    //     pull.drain(console.log)
    //   )

    //   process.stdin.setEncoding('utf8')
    //   process.openStdin().on('data', (chunk) => {
    //     var data = chunk.toString()
    //     p.push(data)
    //   })
    // })

    // console.log('Listener ready, listening on:')
    // peer.multiaddrs.forEach((ma) => {
      // console.log(ma.toString())
      // console.log(ma.toString() + '   /ipfs/' + idListener.toB58String())
    // })

    // // DIALING

    PeerId.createFromJSON(bootstrapID, (err, idBootstrap) => {
      if (err) {
        throw err
      }
      // callback(null, idDialer)

      const peerListener = new PeerInfo(idBootstrap)
      peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/10333'))
      
      node.dialByPeerInfo(peerListener, '/chat/1.0.0', (err, conn) => {
        if (err) {
          throw err
        }
        console.log('nodeA dialed to nodeB on protocol: /chat/1.0.0')
        console.log('Type a message and see what happens')
        // Write operation. Data sent as a buffer
        pull(
          p,
          conn
        )
        // Sink, data converted from buffer to utf8 string
        pull(
          conn,
          pull.map((data) => {
            return data.toString('utf8').replace('\n', '')
          }),
          pull.drain((data) => {
            const peers = JSON.parse(data)
            const thisPeerID = peer.id.toB58String()
            delete peers[thisPeerID]
            peerBook = peers
            console.log('updated peerBook:')
            console.log(peerBook)
            peerBook
              .filter(p => {
                return !connectedPeers.hasOwnProperty(p.id.toB58String())
              })
              
          })
        )

        // process.stdin.setEncoding('utf8')
        // process.openStdin().on('data', (chunk) => {
        //   var data = chunk.toString()
        //   p.push(data)
        // })
        p.push('relays')
      })

    })


  })

})

// var restify = require('restify');
// var server = restify.createServer();
// var activity = []

// function cleanActivity () {
//   activity = activity.slice(0, 1000000)
//   var now = Math.floor(Date.now() / 1000);
//   var i = activity.length
//   while(i-- > 0) {
//     if (activity[i][0] < now - 10) activity.pop()
//   }
// }
// setInterval(cleanActivity, 1000);

// server.get('/hit', function(req, res, next) {
//   var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//   var now = Math.floor(Date.now() / 1000);
//   var hit = [now, ip];
//   activity.unshift(hit)
//   res.json({'status': 'success'});
// });

// server.get('/activity', function(req, res, next) {
//   res.json({'activity': activity})
// });

// server.listen(8080, function() {
//   console.log('%s listening at %s', server.name, server.url);
// });

// //

// const PeerId = require('peer-id')
// const PeerInfo = require('peer-info')
// const Node = require('libp2p-ipfs-nodejs')
// const multiaddr = require('multiaddr')
// const pull = require('pull-stream')
// // const toPull = require('stream-to-pull-stream')
// const async = require('async')
// const Pushable = require('pull-pushable')
// const p = Pushable()
// let idListener

// async.parallel([
//   (callback) => {
//     PeerId.createFromJSON(require('./peer-id-dialer'), (err, idDialer) => {
//       if (err) {
//         throw err
//       }
//       callback(null, idDialer)
//     })
//   },
//   (callback) => {
//     PeerId.createFromJSON(require('./peer-id-listener'), (err, idListener) => {
//       if (err) {
//         throw err
//       }
//       callback(null, idListener)
//     })
//   }
// ], (err, ids) => {
//   if (err) throw err
//   const peerDialer = new PeerInfo(ids[0])
//   peerDialer.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
//   const nodeDialer = new Node(peerDialer)

//   const peerListener = new PeerInfo(ids[1])
//   idListener = ids[1]
//   peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/10333'))
//   nodeDialer.start((err) => {
//     if (err) {
//       throw err
//     }

//     console.log('Dialer ready, listening on:')

//     peerListener.multiaddrs.forEach((ma) => {
//       console.log(ma.toString() + '/ipfs/' + idListener.toB58String())
//     })

    // nodeDialer.dialByPeerInfo(peerListener, '/chat/1.0.0', (err, conn) => {
    //   if (err) {
    //     throw err
    //   }
    //   console.log('nodeA dialed to nodeB on protocol: /chat/1.0.0')
    //   console.log('Type a message and see what happens')
    //   // Write operation. Data sent as a buffer
    //   pull(
    //     p,
    //     conn
    //   )
    //   // Sink, data converted from buffer to utf8 string
    //   pull(
    //     conn,
    //     pull.map((data) => {
    //       return data.toString('utf8').replace('\n', '')
    //     }),
    //     pull.drain(console.log)
    //   )

    //   process.stdin.setEncoding('utf8')
    //   process.openStdin().on('data', (chunk) => {
    //     var data = chunk.toString()
    //     p.push(data)
    //   })
    // })
//   })
// })