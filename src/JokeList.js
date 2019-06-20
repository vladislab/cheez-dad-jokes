import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
import uuid from "uuid/v4";

class JokeList extends Component {
  static defaultProps = {
    numJokestoGet: 10
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.id));
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokestoGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        const joke = res.data;

        if (this.seenJokes.has(joke.id)) {
          console.log("FOUND A DUPLICATE!");
        } else {
          this.seenJokes.add(joke.id);
          jokes.push({ id: res.data.id, text: res.data.joke, votes: 0 });
        }
      }
      console.log(this.seenJokes);

      this.setState(
        st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote = (id, delta) => {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id
            ? {
                ...j,
                votes: j.votes + delta
              }
            : j
        )
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  };

  handleClick = () => {
    this.setState({ loading: true }, this.getJokes);
  };
  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="fa fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }
    let sortedJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>DAD</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="LOLemoji"
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>

        <div className="JokeList-jokes">
          {sortedJokes.map(jk => (
            <Joke
              key={uuid()}
              votes={jk.votes}
              text={jk.text}
              upvote={() => this.handleVote(jk.id, 1)}
              downvote={() => this.handleVote(jk.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}
export default JokeList;
