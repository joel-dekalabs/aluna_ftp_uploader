'use strict'

const DB = require('./database')

class AlunaDB extends DB {
  constructor(config) {
    super(config);
  }

  get components_status_statuses() {
    return {
      add: (date, status_name) => this.query(
        'INSERT INTO components_status_statuses (date, status_name) VALUES(?,?)',
        [
          date,
          status_name
        ]
      )
      .then(data => data.results.insertId)
    }
  }

  get videos_components() {
    return {
      add: (status_id, video_id, order) => this.query(
        'INSERT INTO videos_components (`field`, `order`, `component_type`, `component_id`, `video_id`) VALUES(?,?,?,?,?)',
        [
          'status',
          order,
          'components_status_statuses',
          status_id,
          video_id
        ]
      )
    }
  }

  get lessons_components() {
    return {
      add: (status_id, lesson_id, order) => this.query(
        'INSERT INTO lessons_components (`field`, `order`, `component_type`, `component_id`, `lesson_id`) VALUES(?,?,?,?,?)',
        [
          'status',
          order,
          'components_status_statuses',
          status_id,
          lesson_id
        ]
      )
    }
  }

  get podcast_components() {
    return {
      add: (status_id, podcast_id, order) => this.query(
        'INSERT INTO podcast_components (`field`, `order`, `component_type`, `component_id`, `podcast_id`) VALUES(?,?,?,?,?)',
        [
          'status',
          order,
          'components_status_statuses',
          status_id,
          podcast_id
        ]
      )
    }
  }

  get courses_components() {
    return {
      add: (status_id, course_id, order) => this.query(
        'INSERT INTO courses_components (`field`, `order`, `component_type`, `component_id`, `course_id`) VALUES(?,?,?,?,?)',
        [
          'status',
          order,
          'components_status_statuses',
          status_id,
          course_id
        ]
      )
    }
  }
}

module.exports = AlunaDB
