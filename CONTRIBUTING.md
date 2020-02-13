# Contributing to Graph Protocol Mutations

Welcome to Graph Protocol! Thanks a ton for your interest in contributing.

If you run into any problems feel free to create an issue. PRs are much
appreciated for simple things. If it's something more complex we'd appreciate
having a quick chat in GitHub Issues or Discord.

Join the conversation on our [Discord](https://discord.gg/9a5VCua).

Please follow the [Code of
Conduct](https://github.com/graphprotocol/graph-node/blob/master/CODE_OF_CONDUCT.md)
for all the communications and at events. Thank you!

## Commit messages

We use the following format for commit messages:
```
{package-or-dir}: {Brief description of changes}

{Detailed descipription}
```
For example:
```
mutations: Add mutation state event 'PROGRESS_UPDATE'

This event can be used to inform the dApp how much progress
the resolver has made, 0-1.
```

If multiple packages or directories are being changed list them all like this:
```
mutations, mutations-apollo-react: Fix unit tests
```

## Changelog

We maintain a per-package changelogs using
[Chan](https://github.com/geut/chan/). Whenever you make a change that is worthy
of an entry in the changelog, use the [Chan
CLI](https://github.com/geut/chan/tree/master/packages/chan#chan-action-msg) to
update the changelog.
