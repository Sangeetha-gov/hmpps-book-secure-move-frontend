#!/usr/bin/env bash

GITHUB_DEPLOYMENTS_URL="https://api.github.com/repos/ministryofjustice/hmpps-book-secure-move-frontend/deployments"

while true
do
  DEPLOYED_SHA=$(curl --silent -XGET -H "Authorization: token ${GITHUB_API_TOKEN}" $GITHUB_DEPLOYMENTS_URL | jq -r '.[0].sha')
  if [ "$DEPLOYED_SHA" = "$CIRCLE_SHA1" ]; then
    break
  fi
  sleep 5
done

GITHUB_DEPLOYMENT_STATUS_URL=$(curl --silent -XGET -H "Authorization: token ${GITHUB_API_TOKEN}" $GITHUB_DEPLOYMENTS_URL | jq -r '.[0].statuses_url')

while true
do
  GITHUB_DEPLOYMENT_STATUS=$(curl --silent -XGET -H 'Accept: application/vnd.github.flash-preview+json' -H "Authorization: token ${GITHUB_API_TOKEN}" $GITHUB_DEPLOYMENT_STATUS_URL | jq -r '.[0].state == "success"')
  if [ "$GITHUB_DEPLOYMENT_STATUS" = "true" ]; then
    break
  fi
  sleep 5
done

# Output Review App URL
curl --silent -XGET -H "Authorization: token ${GITHUB_API_TOKEN}" $GITHUB_DEPLOYMENTS_URL | jq -r '.[0].payload.web_url' | sed 's:/*$::'
