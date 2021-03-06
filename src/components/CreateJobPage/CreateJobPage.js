import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { includes } from 'lodash'

import CreateJobPageView from './CreateJobPageView'
import Loader from '../../common/Loader/Loader'
import JobsPanel from '../JobsPanel/JobsPanel'

import functionsActions from '../../actions/functions'
import jobsActions from '../../actions/jobs'

const CreateJobPage = ({
  fetchFunctions,
  fetchFunctionsTemplates,
  functionsStore,
  match,
  removeNewJob
}) => {
  const [functions, setFunctions] = useState([])
  const [selectedGroupFunctions, setSelectedGroupFunctions] = useState({})
  const [templates, setTemplates] = useState(functionsStore.templatesCatalog)

  useEffect(() => {
    fetchFunctions(match.params.projectName).then(functions => {
      const filteredFunctions = functions.filter(
        func => !includes(['', 'handler', 'local'], func.kind)
      )

      const groupedFunctions = Object.values(
        filteredFunctions.reduce((prev, curr) => {
          if (!prev[curr.metadata.name]) {
            prev[curr.metadata.name] = {
              name: curr.metadata.name,
              functions: []
            }
          }

          prev[curr.metadata.name].functions.push(curr)

          return prev
        }, {})
      )

      return setFunctions(groupedFunctions)
    })

    if (functionsStore.templatesCatalog.length === 0) {
      fetchFunctionsTemplates().then(setTemplates)
    }
  }, [
    fetchFunctions,
    fetchFunctionsTemplates,
    functionsStore.templatesCatalog.length,
    match.params.projectName
  ])

  const handleSelectGroupFunctions = item => {
    setSelectedGroupFunctions(item)

    if (!Object.keys(item).length) {
      removeNewJob()
    }
  }

  return functionsStore.loading ? (
    <Loader />
  ) : (
    <>
      <CreateJobPageView
        functions={functions}
        handleSelectGroupFunctions={handleSelectGroupFunctions}
        match={match}
        templates={templates}
      />
      {Object.values(selectedGroupFunctions).length && (
        <JobsPanel
          closePanel={handleSelectGroupFunctions}
          groupedFunctions={selectedGroupFunctions}
          match={match}
        />
      )}
    </>
  )
}

CreateJobPage.propTypes = {
  match: PropTypes.shape({}).isRequired
}

export default connect(functionsStore => functionsStore, {
  ...functionsActions,
  ...jobsActions
})(CreateJobPage)
