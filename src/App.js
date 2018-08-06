import React, { Component } from 'react';
import web3 from './web3';
import ipfs from './ipfs';
import storeHash from "./storehash";

class App extends Component {
  state = {
    ipfsHash: null,
    buffer: '',
    contractAddress: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: ''
  }

  handleSelectFile = (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file);
    reader.onloaded = () => this.convertToBuffer(reader)
  }

  convertToBuffer = async (reader) => {
    const buffer = await Buffer().from(reader.result)
    this.setState({
      buffer: buffer
    })
  }

  // Submitをしたあとの処置
  onSubmit = async (e) => {
    e.preventDefault()

    const accounts = await web3.eth.getAccounts();
    console.log("sending from metamusk accounts", accounts[0])

    const contractAddress = await storeHash.options.address;
    this.setState({
      contractAddress: contractAddress
    });

    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash)
      this.setState({
        ipfsHash: ipfsHash[0].hash
      })

      storeHash.methods.sendHash(this.state.ipfsHash).send({
        from: accounts[0]
      }, (err, transactionHash) => {
        console.log("this is transaction hash")
        console.log(transactionHash)
        this.setState({
          transactionHash: transactionHash
        })
      })
    })
  }

  onClick = async () => {
    try {
      this.setState({
        blockNumber: "Waiting ...",
        gasUsed: "Waiting ..."
      })

      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, reciept) => {
        console.log(err, reciept)
        this.setState({
          txReceipt: reciept
        })
      })

      await this.setState({
        blockNumber: this.state.txReceipt.blockNumber,
        gasUsed: this.state.txReceipt.gasUsed
      });
    } catch(error) {
      console.log(error)
    }
  }

  render() {
    return (
      <div>
        <header>IPFS & Ethereum file uploader</header>

        <hr/>

        <h3>Choose file to send to IPFS</h3>
        <form>
          <input
            type="file"
            onChange={this.handleSelectFile}  
          />
          <button
            bsStyle="primary"
            type="submit"
          >
            Send
          </button>
        </form>

        <hr/>

        <div>
          <button onClick={this.onClick}>Get transaction reciept</button>

          <table>
            <thead>
              <tr>
                <th>Tx Receipt Category</th>
                <th>Values</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>IPFS Hash # stored on Eth Contract</td>
                <td>{this.state.ipfsHash}</td>
              </tr>
              <tr>
                <td>Ethereum Contract Address</td>
                <td>{this.state.ethAddress}</td>
              </tr>
              <tr>
                <td>Tx Hash # </td>
                <td>{this.state.transactionHash}</td>
              </tr>
              <tr>
                <td>Block Number # </td>
                <td>{this.state.blockNumber}</td>
              </tr>
              <tr>
                <td>Gas Used</td>
                <td>{this.state.gasUsed}</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>      
    );
  }
}

export default App;
